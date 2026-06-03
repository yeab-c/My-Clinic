import express from "express";
import authUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";
import {
    getAllDoctors,
    getActiveDoctors,
    getDoctorById,
    updateDoctor,
} from "../controllers/doctor.controller.js";

const doctorRouter = express.Router();

doctorRouter.get("/", getAllDoctors);
doctorRouter.get("/active", authUser, getActiveDoctors);
doctorRouter.get("/:id", getDoctorById);
doctorRouter.put("/:id", authUser, requireAdmin, updateDoctor);

export default doctorRouter;