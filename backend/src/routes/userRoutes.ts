import { Router } from "express";

import { authMiddleware } from "../middleware/auth.js";
import {
  getAllUsers,
  getUser,
  logout
} from "../controllers/user.controller.js";

const router: Router = Router();

// router.post("/register", createUser);

// router.post("/login", login);

router.get("/all", getAllUsers);

router.get("/", authMiddleware, getUser);

router.post("/logout", authMiddleware, logout);
// router.post("/logout-all", authMiddleware, logoutFromAllDevices);

export default router;
