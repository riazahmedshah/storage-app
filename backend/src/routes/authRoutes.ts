import { Router } from "express";
import { googleAuth } from "../controllers/user.controller.js";

const router = Router();

router.post("/google", googleAuth);

export {router as authRouter}