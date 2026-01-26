import { open, rm } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import { NextFunction, Request, Response } from "express";

import { getPublicPath, getSrcPath } from "../utils/pathHelper.js";
import { checkDirectoryAccess, checkFileAccess } from "../utils/checkAccess.js";
import { File } from "../models/file.model.js";

export const createFile = async (
  req: Request, 
  res: Response,
  next:NextFunction
) => {
  const filename = req.header("filename");
  const { _id:userId,rootDirId } = req.user;     
  const parentDirId = req.params.parentDirId || rootDirId;
  if (!filename) return res.status(404).json({ msg: "Filename is missing" });
  const ext = path.extname(filename);
  try {
    await checkDirectoryAccess(parentDirId, userId);
    const file = await File.create({
      name: filename,
      ext,
      parentDirId,
    });

    const targetPath = getPublicPath(file._id.toString());

    const fileHandle = await open(`${targetPath}${ext}`, "w");
    const writeStream = fileHandle.createWriteStream();

    await pipeline(req, writeStream);
    res.status(200).json({ msg: `File ${filename} created successfully` });
  } catch (error) {
    next(error);
  }
};

export const getFile = async (
  req: Request, 
  res: Response,
  next:NextFunction
) => {
  const { _id: userId } = req.user;
  const fileId = req.params.fileId!;
  const srcPath = getSrcPath();

  try {
    const fileData = await checkFileAccess(fileId, userId);
  
    if (req.query.action === "download") {
      res.set("Content-Dispositon", "attachment");
    }
    res.sendFile(`${srcPath}/public/${fileId}${fileData.ext}`);
  } catch (error) {
    next(error);
  }
};

export const updateFile = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  const fileId = req.params.fileId!;
  const { _id: userId } = req.user;
  const { newFilename } = req.body;

  try {
    const fileData = await checkFileAccess(fileId, userId);
    await File.updateOne(
      { _id: fileId },
      { $set: { name: `${newFilename}${fileData.ext}` } },
    );

    res.status(200).json({
      msg: `File Renamed successfully to ${newFilename}${fileData.ext}`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (
  req: Request, 
  res: Response,
  next:NextFunction
) => {
  const fileId = req.params.fileId!;
  const { _id: userId } = req.user;
  const publicPath = getPublicPath();
  try {
    const fileData = await checkFileAccess(fileId, userId);
    await rm(`${publicPath}/${fileId}${fileData.ext}`);

    await File.deleteOne({ _id: fileId });

    res.status(200).json({
      msg: `File ${fileData?.name} Deleted successfully`,
    });
  } catch (error: any) {
    if (error.code == "ENOENT") {
      console.error(error);
      res.status(404).json({ msg: `File not found` });
    }
    next(error)
  }
};
