import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-post", (room) => {
      socket.join(room);
      console.log("Joined room:", room);
    });

   socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
  });
  });

  return io;
};

export { io };
