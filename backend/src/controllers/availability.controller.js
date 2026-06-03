import Availability from "../models/Availability.js";
import Appointment from "../models/Appointment.js";
import generateSlots from "../utils/slots.js";

// get available slots
export const getSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "doctorId and date are required" });
    }

    // All possible slots
    const allSlots = generateSlots();

    // Slots manually blocked by admin
    const availability = await Availability.findOne({ doctorId, date });
    const blockedSlots = availability ? availability.blockedSlots : [];

    // Slots already booked by patients
    const bookedAppointments = await Appointment.find({
      doctorId,
      date,
      status: "upcoming",
    });
    const bookedSlots = bookedAppointments.map((a) => a.time);

    // Build final slot list with status
    const slots = allSlots.map((slot) => {
      if (blockedSlots.includes(slot)) {
        return { time: slot, status: "blocked" };
      }
      if (bookedSlots.includes(slot)) {
        return { time: slot, status: "booked" };
      }
      return { time: slot, status: "available" };
    });

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// admin blocks a slot
export const blockSlot = async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;

    if (!doctorId || !date || !slot) {
      return res.status(400).json({ message: "doctorId, date and slot are required" });
    }

    // Find or create availability doc for that doctor + date
    let availability = await Availability.findOne({ doctorId, date });

    if (!availability) {
      availability = await Availability.create({
        doctorId,
        date,
        blockedSlots: [slot],
      });
    } else {
      if (!availability.blockedSlots.includes(slot)) {
        availability.blockedSlots.push(slot);
        await availability.save();
      }
    }

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// admin unblocks a slot
export const unblockSlot = async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;

    if (!doctorId || !date || !slot) {
      return res.status(400).json({ message: "doctorId, date and slot are required" });
    }

    const availability = await Availability.findOne({ doctorId, date });

    if (!availability) {
      return res.status(404).json({ message: "No availability record found" });
    }

    availability.blockedSlots = availability.blockedSlots.filter((s) => s !== slot);
    await availability.save();

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};