import { Response } from "express";
import { ObjectId } from "mongodb";
import { Dirs } from "../configs/collections.js";

export async function fileAccessCheck(
  res: Response,
  parentDirId: ObjectId,
  userId: ObjectId,
  message: Record<string, string>
): Promise<boolean> {
  const dirs = Dirs();
  const fileParentDir = await dirs.findOne({ _id: parentDirId });
  if (!fileParentDir || fileParentDir.userId.toString() !== userId.toString()) {
    res.status(401).json(message);
    return false;
  }

  return true;
}