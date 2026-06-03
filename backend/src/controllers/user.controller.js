import User from "../models/User.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Register user
export const registerUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        error: "Request body is missing",
      });
    }

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = createToken(user);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        error: "Request body is missing",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};

// Get profile
export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};