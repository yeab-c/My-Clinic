import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import dotenv from "dotenv";

dotenv.config();

const doctors = [
  {
    name:       "Dr. Abebe Kebede",
    specialty:  "Cardiology",
    experience: 8,
    bio:        "Specialist in cardiovascular health and heart disease prevention.",
    price:      1200,
    isActive:   true,
  },
  {
    name:       "Dr. Kebede Abebe",
    specialty:  "General Medicine",
    experience: 5,
    bio:        "Focused on primary care, preventive medicine, and routine checkups.",
    price:      500,
    isActive:   true,
  },
  {
    name:       "Dr. Aster Awoke",
    specialty:  "Dentistry",
    experience: 6,
    bio:        "Expert in dental hygiene, fillings, and cosmetic dentistry.",
    price:      800,
    isActive:   true,
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Doctor.deleteMany({});
  await Doctor.insertMany(doctors);
  console.log("Doctors seeded successfully");
  process.exit();
};

seed();