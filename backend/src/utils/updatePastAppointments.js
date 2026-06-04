import Appointment from "../models/Appointment.js";

export const updatePastAppointments = async () => {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const result = await Appointment.updateMany(
      {
        status: "upcoming",
        $or: [
          // Date is in the past
          { date: { $lt: today } },
          // Date is today and time has passed
          {
            date: today,
            time: { $lt: currentTime },
          },
        ],
      },
      { $set: { status: "past" } }
    );

    // Only log when appointments were actually updated
    if (result.modifiedCount > 0) {
      console.log(`Updated ${result.modifiedCount} appointments to past status`);
    }
    return result;
  } catch (error) {
    console.error("Error updating past appointments:", error);
    throw error;
  }
};

export default updatePastAppointments;
