import { rm } from "node:fs/promises";

import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import { getPublicPath } from "../utils/pathHelper.js";
import { Directory } from "../models/directory.model.js";
import { File } from "../models/file.model.js";
import { checkDirectoryAccess } from "../utils/checkAccess.js";

export const createDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { dirParentId } = req.params;
  const dirname = req.body.dirname || "New Folder";
  const { _id:userId, rootDirId } = req.user;
  try {
    const targetId = dirParentId || rootDirId;
    await checkDirectoryAccess(
      targetId,
      userId
    );

    await Directory.create({
      name: dirname,
      userId,
      parentDirId: targetId,
    });

    res.status(201).json({ msg: "Directory created." });
  } catch (error) {
    next(error);
  }
};

export const getDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { dirId } = req.params;
  const { _id: userId, rootDirId } = req.user;
  try {
    const targetId = dirId || rootDirId;
    const dirData = await checkDirectoryAccess(
      targetId,
      userId,
      dirId ? "Directory" : "Root Directory"
    );

    const filesInfo = await File
      .find({ parentDirId: targetId }).lean();
    const dirsInfo = await Directory
      .find({ parentDirId: targetId }).lean();
    res.json({ ...dirData.toObject(), files: filesInfo, directories: dirsInfo });
  } catch (error) {
    next(error);
  }
};

export const updateDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const dirId = req.params.dirId!;
  const { _id: userId } = req.user;
  const { newDirName } = req.body;
  try {
    await checkDirectoryAccess(dirId, userId);

    await Directory.findByIdAndUpdate(dirId,
      { name: newDirName },{new:true}
    );
    res.status(200).json({ mag: "Renamed successfully!" });
  } catch (error) {
    next(error);
  }
};

export const deleteDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const dirId = req.params.dirId!;
  const { _id: userId } = req.user;
  const publicPath = getPublicPath();

  try {
    const parentDirData = await checkDirectoryAccess(dirId, userId);
    
    async function getNestedContent(id: ObjectId) {
      let [filesData, dirsData] = await Promise.all([
        File.find({ parentDirId: id },'ext').lean(),
        Directory.find({ parentDirId: id }, 'name').lean()
      ]);
      for (const { _id } of dirsData) {
        const { dirsData: childDirs, filesData: childFiles } =
          await getNestedContent(_id);

        filesData = [...filesData, ...childFiles];
        dirsData = [...dirsData, ...childDirs];
      }

      return { filesData, dirsData };
    }

    const { filesData, dirsData } = await getNestedContent(new ObjectId(dirId));
    // console.log(filesData, dirsData);
    if (filesData.length > 0) {
      await Promise.all(
        filesData.map((file) => rm(`${publicPath}/${file._id}${file.ext}`)),
      );
    }
    await Promise.all([
      File.deleteMany({ _id: { $in: filesData.map((file) => file._id) } }),
      Directory.deleteMany({ _id: { $in: dirsData.map((dir) => dir._id) } })
    ]);

    if (parentDirData.parentDirId !== null) {
      await Directory.deleteOne({ _id: new ObjectId(dirId) });
      return res.status(200).json({ msg: `Dir ${parentDirData.name} deleted` });
    }
    res.status(200).json({ msg: "Root Directory emptied" });
  } catch (error: any) {
    if (error.code == "ENOENT") {
      console.error(error);
      res.status(404).json({ msg: `File not found` });
    }
    next(error);
  }
};
