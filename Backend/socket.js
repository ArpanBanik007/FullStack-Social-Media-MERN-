// socket/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "./models/user.models.js";
import { markMessagesAsSeen } from "./services/message.services.js";

const onlineUsers = new Map();
let _io = null;

const isUserOnline = (userId) => {
  const sockets = onlineUsers.get(userId.toString());
  return sockets && sockets.size > 0;
};

const broadcastOnlineUsers = (io) => {
  io.emit("online-users", Array.from(onlineUsers.keys()));
};

export const initSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  _io = io;
  app.set("io", io);

  // ════════════════════════════════
  // AUTH MIDDLEWARE
  // ════════════════════════════════
  io.use(async (socket, next) => {
    try {
      // 🔓 STRIKT TOKEN-BASED AUTH (No Cookies)
      const token = socket.handshake.auth?.token;

      if (!token) {
        console.log("❌ Socket Auth Failed: No token provided");
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded._id).select(
        "name avatar isActive"
      );

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      if (!user.isActive) {
        return next(new Error("Authentication error: Account deactivated"));
      }

      socket.userId = user._id.toString();
      socket.user = user;

      next();
    } catch (err) {
      console.error("❌ Socket Auth Error:", err.message);
      if (err.name === "JsonWebTokenError") {
        return next(new Error("Authentication error: Invalid token"));
      }
      if (err.name === "TokenExpiredError") {
        return next(new Error("Authentication error: Token expired"));
      }
      next(new Error("Authentication error"));
    }
  });

  // ════════════════════════
  // CONNECTION
  // ════════════════════════
  io.on("connection", async (socket) => {
    // ALWAYS extract userId from query first, fallback to middleware userId just in case
    const userId = socket.handshake.query.userId || socket.userId;
    
    if (!userId) {
      console.log(`⚠️ Socket connected without userId: ${socket.id}`);
      return;
    }

    console.log(`✅ Socket connected: ${userId} (${socket.id})`);

    // Add to in-memory tracking
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    console.log("User connected:", userId);
    console.log("Online Users:", onlineUsers);

    // Broadcast updated list to everyone
    io.emit("online-users", Array.from(onlineUsers.keys()));

    socket.on("user-online", (incomingUserId) => {
      // Keep for backwards compatibility if needed, but the main logic is now on connection
      const uid = incomingUserId || userId;
      if (!onlineUsers.has(uid)) {
        onlineUsers.set(uid, new Set());
      }
      onlineUsers.get(uid).add(socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.join(userId);

    // ──────────────────────────────────
    // joinRoom
    // ──────────────────────────────────
    socket.on("joinRoom", (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`📌 ${userId} joined room: ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      if (!roomId) return;
      socket.leave(roomId);
    });

    // ──────────────────────────────────
    // Typing indicator
    // ──────────────────────────────────
    socket.on("typing", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit("typing", {
        conversationId,
        userId,
        userName: socket.user.name,
      });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit("stopTyping", {
        conversationId,
        userId,
      });
    });

    // ──────────────────────────────────
    // Message seen
    // ──────────────────────────────────
    socket.on("messageSeen", async ({ chatId }) => {
      if (!chatId) return;
      try {
        const seenCount = await markMessagesAsSeen(chatId, userId);

        if (seenCount > 0) {
          io.to(chatId).emit("messageSeen", {
            chatId,
            seenBy: userId,
            seenAt: new Date(),
          });
        }
      } catch (err) {
        console.error("messageSeen socket error:", err);
        socket.emit("socketError", {
          event: "messageSeen",
          message: "Failed to mark messages as seen",
        });
      }
    });

    // ──────────────────────────────────
    // Video call signaling
    // ──────────────────────────────────
    socket.on("callUser", ({ receiverId, offer, callerName }) => {
      io.to(receiverId).emit("incomingCall", {
        callerId: userId,
        callerName,
        offer,
      });
    });

    socket.on("callAnswer", ({ callerId, answer }) => {
      io.to(callerId).emit("callAnswered", { answer });
    });

    socket.on("iceCandidate", ({ receiverId, candidate }) => {
      io.to(receiverId).emit("iceCandidate", { candidate });
    });

    socket.on("callEnded", ({ receiverId }) => {
      io.to(receiverId).emit("callEnded");
    });

    // ──────────────────────────────────
    // Disconnect
    // ──────────────────────────────────
    socket.on("disconnect", async (reason) => {
      console.log(`❌ Socket disconnected: ${userId} — reason: ${reason}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          const lastSeen = new Date();
          // Update lastSeen in DB
          User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen,
          }).catch(console.error);
        }
      }
      
      // Broadcast updated online users list
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export const getIO = () => {
  if (!_io) {
    throw new Error("Socket.io not initialized yet!");
  }
  return _io;
};

export { isUserOnline };