import express from "express";
import authUser from "../middleware/auth.middleware.js";
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    cancelAppointment,
} from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/create", authUser, createAppointment);
appointmentRouter.get("/", authUser, getAppointments);
appointmentRouter.get("/:id", authUser, getAppointmentById);
appointmentRouter.patch("/:id/cancel", authUser, cancelAppointment);

export default appointmentRouter;