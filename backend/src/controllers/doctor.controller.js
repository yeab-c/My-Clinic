import Doctor from "../models/Doctor.js";

// Get all doctors
export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// Get only active doctors
export const getActiveDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get doctor
export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        res.status(200).json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },          // only updates fields that are sent
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};