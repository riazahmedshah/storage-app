import { Router } from "express";
import {
  createFile,
  deleteFile,
  getFile,
  updateFile,
} from "../controllers/file.controller.js";

const router: Router = Router();

// CREATE
router.post("{/:parentDirId}", createFile);

// READ
router.get("/:fileId", getFile);

// UPADATE
router.patch("/:fileId", updateFile);

// DELETE
router.delete("/:fileId", deleteFile);

export default router;
