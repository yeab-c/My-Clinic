import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: "admin@gmail.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name:     "Admin",
    email:    "admin@gmail.com",
    password: hashedPassword,
    phone:    "0900000000",
    role:     "admin",
  });

  console.log("Admin seeded successfully");
  process.exit();
};

seedAdmin();