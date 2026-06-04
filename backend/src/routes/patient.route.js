import express from "express";
import authUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";
import { getPatients, getPatientById, updateProfile } from "../controllers/patient.controller.js";

const patientRouter = express.Router();

patientRouter.get("/",    authUser, requireAdmin, getPatients);      
patientRouter.get("/:id", authUser, requireAdmin, getPatientById);
patientRouter.put("/:id/profile", authUser, updateProfile);  

export default patientRouter;