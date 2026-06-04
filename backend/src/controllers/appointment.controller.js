import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import updatePastAppointments from "../utils/updatePastAppointments.js";

// patient creates appointment
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, service, date, time, reason } = req.body;

    if (!doctorId || !service || !date || !time) {
      return res.status(400).json({ message: "doctorId, service, date and time are required" });
    }

    
    const availability = await Availability.findOne({ doctorId, date });
    if (availability && availability.blockedSlots.includes(time)) {
      return res.status(400).json({ message: "This slot is blocked" });
    }

    
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: "upcoming",
    });
    if (existingAppointment) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      service,
      date,
      time,
      reason,
    });

    // Populate doctor and patient info before returning
    const populated = await appointment.populate([
      { path: "doctorId",  select: "name specialty" },
      { path: "patientId", select: "name email" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// patient sees own, admin sees all
export const getAppointments = async (req, res) => {
  try {
    // Update any past appointments before fetching
    await updatePastAppointments();

    const { status } = req.query;

    let filter = {};

    // Patient only sees their own
    if (req.user.role === "patient") {
      filter.patientId = req.user.id;
    }

    // Optional status filter
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate("doctorId",  "name specialty price")
      .populate("patientId", "name email phone")
      .sort({ date: 1, time: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get single appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId",  "name specialty price")
      .populate("patientId", "name email phone");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Patient can only view their own
    if (
      req.user.role === "patient" &&
      appointment.patientId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// patient or admin cancels
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Patient can only cancel their own
    if (
      req.user.role === "patient" &&
      appointment.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Appointment already cancelled" });
    }

    if (appointment.status === "past") {
      return res.status(400).json({ message: "Cannot cancel a past appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};