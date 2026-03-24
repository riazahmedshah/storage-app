import { Router } from "express";
import {
  createDirectory,
  deleteDirectory,
  getDirectory,
  updateDirectory,
} from "../controllers/directory.controller.js";
import { validateReqBody } from "../middleware/zod.middleware.js";
import { updateDirSchema } from "../validators/dir.validators.js";

const router: Router = Router();

// CREATE
router.post("{/:dirParentId}", createDirectory);

// READ
router.get("{/:dirId}", getDirectory);

// UPDATE
router.patch("/:dirId", validateReqBody(updateDirSchema), updateDirectory);

// DELETE
router.delete("/:dirId", deleteDirectory);

export default router;
