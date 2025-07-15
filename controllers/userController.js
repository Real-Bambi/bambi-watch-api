import { User } from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";


// Get all users — no passwords!
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("Found user:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  const user = req.user;

  const updates = {};

  if (req.body.bio) {
    updates.bio = req.body.bio.trim();
  }

  if (req.file) {
    // Upload file buffer using stream
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            resource_type: "image",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    try {
      const result = await streamUpload();
      updates.avatarUrl = result.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return res.status(500).json({ message: "Failed to upload avatar" });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    username: updatedUser.username,
    email: updatedUser.email,
    bio: updatedUser.bio,
    avatarUrl: updatedUser.avatarUrl,
  });
};


// DELETE /api/v1/users/me
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};