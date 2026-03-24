import fs from "fs/promises";
import path from "node:path";

import { Request, Response } from "express";

import { getPublicPath } from "../utils/pathHelper.js";
import { checkDirectoryAccess } from "../utils/checkAccess.js";
import { DirectoryRepository } from "../repositories/dir.repository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { FileRepository } from "../repositories/file.repository.js";
import { AppError } from "../utils/AppError.js";
import { updateDirInput } from "../validators/dir.validators.js";

const dirRepository = new DirectoryRepository();

export const createDirectory = asyncHandler(
  async (req: Request, res: Response) => {
    const { dirParentId } = req.params;
    const dirname = req.body.dirname || "New Folder";
    const { user, rootDirectoryId } = req.user;

    const targetId = dirParentId || rootDirectoryId;
    await checkDirectoryAccess(targetId!, user.id);

    await dirRepository.create({
      name: dirname,
      userId: user.id,
      parentDirId: targetId,
    });

    return ResponseHandler.success(res, 201, "Directory created.");
  },
);

export const getDirectory = asyncHandler(
  async (req: Request, res: Response) => {
    const { dirId } = req.params;
    const { user, rootDirectoryId } = req.user;
    const targetId = dirId || rootDirectoryId;

    const dirData = await dirRepository.getDirectoryContents(
      targetId!,
      user.id,
    );

    if (!dirData) {
      throw new AppError(
        dirId ? "Directory not found" : "Root Directory not found",
        404,
      );
    }

    return ResponseHandler.success(res, 200, "SUCCESS", dirData);
  },
);

export const updateDirectory = asyncHandler(
  async (
    req: Request<{ dirId: string }, {}, updateDirInput>,
    res: Response,
  ) => {
    const dirId = req.params.dirId;
    const { name } = req.body;
    const { user } = req.user;

    const response = await dirRepository.update(dirId, user.id, { name });

    if (!response) throw new AppError("NOT_FOUND", 404);

    return ResponseHandler.success(res, 200, "Renamed successfully!");
  },
);

export const deleteDirectory = asyncHandler(
  async (req: Request<{ dirId: string }>, res: Response) => {
    const { dirId } = req.params;
    const { user } = req.user;

    const result = await dirRepository.deleteDirectoryAndGetFiles(
      dirId,
      user.id,
    );

    if (!result || !result.deletedDir) {
      throw new AppError("Directory not found or unauthorized", 404);
    }

    const { deletedDir, fileNames } = result;

    const STORAGE_PATH = getPublicPath();

    const deletePromises = fileNames.map(async (fileName) => {
      try {
        const filePath = path.join(STORAGE_PATH, fileName);
        await fs.unlink(filePath);
      } catch (err) {
        // Log the error but don't crash. If a file was already missing,
        // we still want to finish deleting the rest of them.
        console.error(`Local file cleanup failed for ${fileName}:`, err);
      }
    });

    await Promise.all(deletePromises);

    return ResponseHandler.success(
      res,
      200,
      "Directory and all contained files deleted successfully",
      deletedDir,
    );
  },
);

// export const deleteDirectory = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const dirId = req.params.dirId!;
//   const { _id: userId } = req.user;
//   const publicPath = getPublicPath();

//   try {
//     const parentDirData = await checkDirectoryAccess(dirId, userId);

//     async function getNestedContent(id: ObjectId) {
//       let [filesData, dirsData] = await Promise.all([
//         File.find({ parentDirId: id },'ext').lean(),
//         Directory.find({ parentDirId: id }, 'name').lean()
//       ]);
//       for (const { _id } of dirsData) {
//         const { dirsData: childDirs, filesData: childFiles } =
//           await getNestedContent(_id);

//         filesData = [...filesData, ...childFiles];
//         dirsData = [...dirsData, ...childDirs];
//       }

//       return { filesData, dirsData };
//     }

//     const { filesData, dirsData } = await getNestedContent(new ObjectId(dirId));
//     // console.log(filesData, dirsData);
//     if (filesData.length > 0) {
//       await Promise.all(
//         filesData.map((file) => rm(`${publicPath}/${file._id}${file.ext}`)),
//       );
//     }
//     await Promise.all([
//       File.deleteMany({ _id: { $in: filesData.map((file) => file._id) } }),
//       Directory.deleteMany({ _id: { $in: dirsData.map((dir) => dir._id) } })
//     ]);

//     if (parentDirData.parentDirId !== null) {
//       await Directory.deleteOne({ _id: new ObjectId(dirId) });
//       return res.status(200).json({ msg: `Dir ${parentDirData.name} deleted` });
//     }
//     res.status(200).json({ msg: "Root Directory emptied" });
//   } catch (error: any) {
//     if (error.code == "ENOENT") {
//       console.error(error);
//       res.status(404).json({ msg: `File not found` });
//     }
//     next(error);
//   }
// };
