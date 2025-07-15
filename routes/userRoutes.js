import express from "express";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { updateProfile, getProfile, deleteProfile, getAllUsers } from "../controllers/userController.js";
import { updateProfileSchema } from "../validators/userValidator.js";
import { upload } from "../config/multer.js";

export const userRoutes = express.Router();


userRoutes.get("/me", protect, getProfile);
userRoutes.patch(
  "/me",
  protect,
  upload.single("avatar"), // handles the file part
  validate(updateProfileSchema),
  updateProfile
);
userRoutes.delete("/me", protect, deleteProfile);
userRoutes.get("/", protect, getAllUsers);
