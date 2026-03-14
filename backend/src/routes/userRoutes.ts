import { Router } from "express";

import { authMiddleware } from "../middleware/auth.js";
import {
  getAllUsers,
  getUser,
  login,
  logout,
  logoutNotByUser,
  deleteNotByUser,
  createUser
} from "../controllers/user.controller.js";
import { AppError } from "../utils/AppError.js";

const router: Router = Router();

router.post("/register", createUser);

router.post("/login", login);

router.get("/all", authMiddleware, (req, res, next) => {
  if(req.user.role === 'USER') throw new AppError("Forbidden", 403);
  next();
},getAllUsers);

router.get("/", authMiddleware, getUser);

router.post("/logout", authMiddleware, logout);
// router.post("/logout-all", authMiddleware, logoutFromAllDevices);

router.post("/:userId/logout", authMiddleware, logoutNotByUser);
router.delete("/:userId/", authMiddleware, deleteNotByUser);

export default router;
