import { Types } from "mongoose";

import { Directory } from "../models/directory.model.js";
import { File } from "../models/file.model.js";

import { AppError } from "./AppError.js";


export const checkDirectoryAccess = async(
  directoryId: Types.ObjectId | string,
  userId: Types.ObjectId | string,
  resourceName: string = "Directory"
) => {
  const directory = await Directory.findById(directoryId);
  if (!directory) {
    throw new AppError(`${resourceName} not found`, 404);
  };

  if(!directory.userId.equals(userId)){
    throw new AppError("You do not have permission", 403);
  };

  return directory;
}

export const checkFileAccess = async(
  fileId: Types.ObjectId | String,
  userId: Types.ObjectId | string
) => {
  const file = await File.findById(fileId);
  if(!file){
    throw new AppError("File not found", 404);
  }

  await checkDirectoryAccess(file.parentDirId, userId);

  return file;
}