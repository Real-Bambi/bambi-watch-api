import mongoose from "mongoose";

import {Room} from "../models/room.js";
import extractVideoId from "../utils/extractVideoId.js";
import Message from "../models/message.js";
import { roomUsers } from "./socketHandler.js";

// Create new room
export const createRoom = async (req, res) => {
  const { videoUrl, name } = req.body;

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    const newRoom = await Room.create({
      videoId,
      name,
      createdBy: req.user.id, // Comes from authMiddleware
    });

    res.status(201).json({
      roomId: newRoom._id,
      videoId: newRoom.videoId,
      name: newRoom.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get room by ID
export const getRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findById(id).populate("createdBy", "username");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get chat history for a room
export const getRoomMessages = async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await Message.find({ roomId : new mongoose.Types.ObjectId(id)})
      .sort({ createdAt: 1 }) // oldest first
      .select("username message createdAt");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getActiveRooms = async (req, res) => {
  try {
    // Extract unique room IDs from active sockets
    const activeRoomIds = [
      ...new Set(Object.values(roomUsers).map((u) => u.roomId)),
    ];

    // If no active room IDs, return the new structure immediately
    if (activeRoomIds.length === 0) {
      return res.json({
        hasActiveRooms: false,
        rooms: [],
      });
    }

    // Otherwise, get room details from DB
    const rooms = await Room.find({ _id: { $in: activeRoomIds } });

    //  Add user count to each room
    const result = rooms.map((room) => {
      const count = Object.values(roomUsers).filter(
        (u) => u.roomId === String(room._id)
      ).length;

      return {
        roomId: room._id,
        name: room.name,
        videoId: room.videoId,
        usersOnline: count,
      };
    });

    // Return the new structured response
    res.json({
      hasActiveRooms: true,
      rooms: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active rooms" });
  }
};
