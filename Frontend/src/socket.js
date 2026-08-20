import { io } from "socket.io-client";
import { store } from "./store/store";

let realSocket = null;

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";

export const connectSocket = (userId) => {
  if (realSocket?.connected) {
    console.log("✅ Socket already connected:", realSocket.id);
    return realSocket;
  }

  const state = store.getState();

  if (!userId) {
    userId = state.mydetails?.mydetails?._id;
  }

  if (!userId) {
    console.warn("connectSocket: userId নেই, skip করছি");
    return null;
  }

  const token = state.mydetails?.accessToken;

  if (!token) {
    console.warn("connectSocket: accessToken নেই, skip করছি");
    return null;
  }

  if (realSocket) {
    realSocket.disconnect();
    realSocket = null;
  }

  // Socket.IO should connect to the base URL, not the /api/v1 path
  const url = new URL(SOCKET_URL);
  const baseUrl = `${url.protocol}//${url.host}`;

  realSocket = io(baseUrl, {
    auth: (cb) => {
      // Reconnect howar somoyeo সবসময় latest token pathানো হবে
      const latestState = store.getState();
      cb({ token: latestState.mydetails?.accessToken });
    },
    query: { userId },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  realSocket.on("connect", () => {
    console.log("✅ Connected:", realSocket.id);
  });

  realSocket.on("connect_error", (err) => {
    console.log("❌ Error:", err.message);
  });

  realSocket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  return realSocket;
};

export const getSocket = () => realSocket;

export const disconnectSocket = () => {
  if (realSocket) {
    realSocket.disconnect();
    realSocket = null;
  }
};