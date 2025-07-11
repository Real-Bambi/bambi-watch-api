import {User} from "../models/user.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register user
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const newUser = await User.create({ username, email, password });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      token: generateToken(newUser),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
