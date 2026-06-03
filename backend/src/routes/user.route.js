import express from "express";
import authUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";
import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authUser, getProfile);
userRouter.get("/", authUser, requireAdmin, getAllUsers);

export default userRouter;