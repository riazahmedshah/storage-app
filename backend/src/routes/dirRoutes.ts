import { Router } from "express";
import {
  createDirectory,
  deleteDirectory,
  getDirectory,
  updateDirectory,
} from "../controllers/directory.controller.js";

const router: Router = Router();

// CREATE
router.post("{/:dirParentId}", createDirectory);

// READ
router.get("{/:dirId}", getDirectory);

// UPDATE
router.patch("/:dirId", updateDirectory);

// DELETE
router.delete("/:dirId", deleteDirectory);

export default router;
