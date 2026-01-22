import { Router } from "express";

import { authMiddleware } from "../middleware/auth.js";
import {
  createUser,
  getUser,
  login,
  logout,
} from "../controllers/user.controller.js";

const router: Router = Router();

router.post("/register", createUser);

router.post("/login", login);

router.get("/", authMiddleware, getUser);

router.post("/logout", logout);

export default router;
