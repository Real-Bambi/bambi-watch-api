import mongoose from "mongoose";

import {Room} from "../models/room.js";
import extractVideoId from "../utils/extractVideoId.js";
import Message from "../models/message.js";

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
