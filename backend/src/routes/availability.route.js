import express from "express";
import authUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";
import {
  getSlots,
  blockSlot,
  unblockSlot,
} from "../controllers/availability.controller.js";

const availabilityRouter = express.Router();

availabilityRouter.get("/", authUser, getSlots);                   
availabilityRouter.post("/block", authUser, requireAdmin, blockSlot);    
availabilityRouter.delete("/block", authUser, requireAdmin, unblockSlot); 

export default availabilityRouter;