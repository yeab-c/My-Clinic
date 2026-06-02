import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date:         { type: String, required: true },        // "2026-06-10"
    blockedSlots: { type: [String], default: [] },         // ["09:00", "10:30"]
  },
  { timestamps: true }
);

// One availability document per doctor per date
availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });

const Availability = mongoose.models.Availability || mongoose.model('Availability', availabilitySchema);

export default Availability;