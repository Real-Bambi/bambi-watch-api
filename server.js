import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

// MongoDB connection
import connectDB from "./config/db.js";
import handleSocketEvents from "./controllers/socketHandler.js";

// Routes
import {authRoutes} from "./routes/authRoutes.js";
import {roomRoutes} from "./routes/roomRoutes.js";

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

// Create app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/rooms", roomRoutes);

// Socket.IO
io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  //sync + chat events
  handleSocketEvents(io, socket);

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
