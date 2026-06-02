import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    service: {
      type: String,
      enum: ["General Consultation", "Dental Checkup", "Specialist Consultation"],
      required: true,
    },
    date:   { type: String, required: true },   // "2026-06-10"
    time:   { type: String, required: true },   // "09:00"
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["upcoming", "cancelled", "past"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default Appointment;