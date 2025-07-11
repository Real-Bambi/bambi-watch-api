// routes/authRoutes.js
import express from "express";
import { register, login } from "../controllers/authController.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

export const authRoutes = express.Router();

authRoutes.post("/register",  validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);

authRoutes.get("/", (req, res) => {
  res.send("Auth route works!");
});


