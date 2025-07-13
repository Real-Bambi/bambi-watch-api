// routes/authRoutes.js
import express from "express";
import { createRoom, getRoom, getRoomMessages } from "../controllers/roomController.js";
import validate from "../middleware/validate.js";
import protect from "../middleware/authMiddleware.js";
import { createRoomSchema } from "../validators/roomValidator.js";

export const roomRoutes = express.Router();

// Create room → must be logged in
roomRoutes.post("/", protect, validate(createRoomSchema), createRoom);

// Get room info by ID
roomRoutes.get("/:id", protect, getRoom);

// Get chat history for a room
roomRoutes.get("/:id/messages", protect, getRoomMessages);

// roomRoutes.get("/", (req, res) => {
//   res.send("Auth route works!");
// });


