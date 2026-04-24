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
  const onlineList = Array.from(onlineUsers.keys());
  io.emit("onlineUsers", onlineList);
};

export const initSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
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
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      if (!token && socket.handshake.headers.cookie) {
        const match = socket.handshake.headers.cookie.match(/accessToken=([^;]+)/);
        if (match) {
          token = match[1];
        }
      }

      if (!token) {
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
    const userId = socket.userId;
    console.log(`✅ Socket connected: ${userId} (${socket.id})`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    socket.join(userId);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    broadcastOnlineUsers(io);

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

          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          broadcastOnlineUsers(io);
        }
      }
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