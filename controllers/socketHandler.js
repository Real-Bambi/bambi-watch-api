// controllers/socketHandler.js
import Message from "../models/message.js";


export default function handleSocketEvents(io, socket) {
  console.log("📡 Socket connected:", socket.id);

  // When a user joins a watch room
  socket.on("joinRoom", async ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`👥 ${username} joined room ${roomId}`);

    // Count how many are now in the room
    const sockets = await io.in(roomId).allSockets();
    const numWatching = sockets.size;

    // Notify everyone in the room
    io.in(roomId).emit("room:usersUpdate", {
      count: numWatching,
    });
  });

  // Handle leaving room when disconnecting
  socket.on("disconnecting", async () => {
    const rooms = socket.rooms;
    rooms.forEach(async (roomId) => {
      if (roomId !== socket.id) {
        const sockets = await io.in(roomId).allSockets();
        const numWatching = sockets.size - 1; // subtract this socket
        io.in(roomId).emit("room:usersUpdate", { count: numWatching });
      }
    });
  });

  // --- Playback sync ---
  socket.on("video:play", ({ roomId, time }) => {
    socket.to(roomId).emit("video:play", { time });
  });

  socket.on("video:pause", ({ roomId, time }) => {
    socket.to(roomId).emit("video:pause", { time });
  });

  socket.on("video:seek", ({ roomId, time }) => {
    socket.to(roomId).emit("video:seek", { time });
  });

  // --- Group chat ---
  socket.on("chat:message", async ({ roomId, userId, username, message }) => {
    // Save to DB
  await Message.create({
    roomId,
    userId,
    username,
    message,
  });

    // Broadcast to everyone in room
    io.in(roomId).emit("chat:message", {
      username,
      message,
      timestamp: new Date().toISOString(),
    });
  });
}
