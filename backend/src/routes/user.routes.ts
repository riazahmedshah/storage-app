import { Router } from "express";
import {
  login,
  register
} from "../controllers/user.controller.js";
import { validateReqBody } from "../middleware/zod.middleware.js";
import { loginUserSchema, registerUserSchema } from "../validators/user.validators.js";

const router: Router = Router();

router.post("/register", validateReqBody(registerUserSchema), register);

router.post("/login", validateReqBody(loginUserSchema) ,login);

// router.get("/all", authMiddleware, (req, res, next) => {
//   if(req.user.role === 'USER') throw new AppError("Forbidden", 403);
//   next();
// },getAllUsers);

// router.get("/", authMiddleware, getUser);

// router.post("/logout", authMiddleware, logout);
// // router.post("/logout-all", authMiddleware, logoutFromAllDevices);

// router.post("/:userId/logout", authMiddleware, logoutNotByUser);
// router.delete("/:userId/", authMiddleware, deleteNotByUser);

export default router;
