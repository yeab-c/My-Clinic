import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

// get all patients - admin only
export const getPatients = async (req, res) => {
  try {
    const { search } = req.query;

    // Build search filter
    let filter = { role: "patient" };
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const patients = await User.find(filter).select("-password");

    // For each patient get their appointment stats
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const totalAppointments = await Appointment.countDocuments({
          patientId: patient._id,
        });

        const lastVisit = await Appointment.findOne({
          patientId: patient._id,
          status:    "past",
        })
          .sort({ date: -1 })
          .select("date");

        return {
          _id:               patient._id,
          name:              patient.name,
          email:             patient.email,
          phone:             patient.phone,
          createdAt:         patient.createdAt,
          totalAppointments,
          lastVisit:         lastVisit ? lastVisit.date : null,
        };
      })
    );

    res.status(200).json(patientsWithStats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get patient by ID - admin only, single patient with full history
export const getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select("-password");

    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointments = await Appointment.find({ patientId: req.params.id })
      .populate("doctorId", "name specialty")
      .sort({ date: -1 });

    res.status(200).json({ patient, appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { name, phone } },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};