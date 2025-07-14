import mongoose from "mongoose"; 
import Message from "../models/message.js";

//  Tracks connected socket's user & room
export const roomUsers = {};

export default function handleSocketEvents(io, socket) {
  // console.log("📡 Socket connected:", socket.id);

  // --- When a user joins a watch room ---
  socket.on("joinRoom", async ({ roomId, username }) => {
    socket.join(roomId);
    // console.log(`👥 ${username} joined room ${roomId}`);

    // Save this socket's info
    roomUsers[socket.id] = { username, roomId };

    // Get current users in the room
    const sockets = await io.in(roomId).fetchSockets();
    const users = sockets.map(s => roomUsers[s.id]?.username).filter(Boolean);

    // Update watchers list
    io.in(roomId).emit("room:usersUpdate", {
      count: users.length,
      users: users,
    });

    //  Broadcast as *system* event, NOT chat message!
    io.in(roomId).emit("room:systemMessage", {
      message: `${username} joined`,
      timestamp: new Date().toISOString(),
    });
  });

  // --- Handle leaving room when disconnecting ---
  socket.on("disconnecting", async () => {
    const { roomId, username } = roomUsers[socket.id] || {};

    if (roomId) {
      delete roomUsers[socket.id];

      const sockets = await io.in(roomId).fetchSockets();
      const users = sockets.map(s => roomUsers[s.id]?.username).filter(Boolean);

      io.in(roomId).emit("room:usersUpdate", {
        count: users.length,
        users: users,
      });

      //  Broadcast as *system* event, NOT chat message!
      io.in(roomId).emit("room:systemMessage", {
        message: `${username || "A user"} left`,
        timestamp: new Date().toISOString(),
      });
    }
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

  // --- Group chat (real) ---
  socket.on("chat:message", async ({ roomId, userId, username, message }) => {
    console.log("Server received chat:message:", {
      roomId,
      message,
      userId,
      username,
    });

    //  Save only real user messages — convert IDs to ObjectId!
    await Message.create({
      roomId: new mongoose.Types.ObjectId(roomId),
      userId: new mongoose.Types.ObjectId(userId),
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
