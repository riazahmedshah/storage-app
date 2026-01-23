// import { rm } from "node:fs/promises";

// import { NextFunction, Request, Response } from "express";
// import { ObjectId } from "mongodb";

// import { Dirs, Files } from "../configs/collections.js";
// import { getPublicPath } from "../utils/pathHelper.js";

// export const createDirectory = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { _id, rootDirId } = req.user;
//   const dirname = req.header("dirname") || "New Folder";
//   const dirParentId: string = req.params.dirParentId || rootDirId.toString();
//   const dirs = Dirs();
//   try {
//     const parentDir = await dirs.findOne({ _id: new ObjectId(dirParentId) });
//     if (!parentDir)
//       return res
//         .status(404)
//         .json({ message: "Parent Directory Does not exist!" });

//     if (parentDir.userId.toString() !== _id?.toString()) {
//       return res.status(404).json({ message: "Chala ja BSDK..." });
//     }

//     await dirs.insertOne({
//       name: dirname,
//       userId: _id,
//       parentDirId: new ObjectId(dirParentId),
//     });

//     res.status(201).json({ msg: "Directory created." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Error in Dir API" });
//   }
// };

// export const getDirectory = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const dirId = req.params.dirId || req.user.rootDirId;
//   const { _id: userId, rootDirId } = req.user;
//   const dirs = Dirs();
//   const files = Files();
//   try {
//     const userRootDir = await dirs.findOne({ _id: rootDirId });
//     const dirData = dirId
//       ? await dirs.findOne({ _id: new ObjectId(dirId) })
//       : userRootDir;

//     if (!dirData)
//       return res.status(404).json({ message: "Directory not found!" });

//     if (dirData.userId.toString() !== userId?.toString()) {
//       return res.status(401).json({ message: "You don't have permission!" });
//     }
//     // const filesInfo = await files.find({_id: {$in:dirData.files}}).toArray();
//     const filesInfo = await files
//       .find({ parentDirId: new ObjectId(dirId) })
//       .toArray();
//     const dirsInfo = await dirs
//       .find({ parentDirId: new ObjectId(dirId) })
//       .toArray();
//     res.json({ ...dirData, files: filesInfo, directories: dirsInfo });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ mes: "ERROR in get dir api" });
//   }
// };

// export const updateDirectory = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { dirId } = req.params;
//   const { _id: userId } = req.user;
//   const { newDirName } = req.body;
//   const dirs = Dirs();

//   try {
//     const result = await dirs.updateOne(
//       { _id: new ObjectId(dirId), userId: userId },
//       { $set: { name: newDirName } },
//     );
//     if (!result.acknowledged)
//       return res.status(400).json({ msg: "Error in update DB DirName api" });
//     res.status(200).json({ mag: "Renamed successfully!" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ msg: "Error in update DirName api" });
//   }
// };

// export const deleteDirectory = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { dirId } = req.params;
//   const { _id: userId } = req.user;
//   const publicPath = getPublicPath();
//   const dirs = Dirs();
//   const files = Files();

//   try {
//     const parentDirData = await dirs.findOne({ _id: new ObjectId(dirId) });
//     if (!parentDirData)
//       return res.status(404).json({ message: "Directory not found!" });
//     if (parentDirData.userId.toString() !== userId.toString())
//       return res.status(401).json({ message: "You don't have permission!" });

//     async function getNestedContent(id: ObjectId) {
//       let filesData = await files
//         .find({ parentDirId: id }, { projection: { ext: 1 } })
//         .toArray();
//       let dirsData = await dirs
//         .find({ parentDirId: id }, { projection: { name: 1 } })
//         .toArray();

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

//     await files.deleteMany({ _id: { $in: filesData.map((file) => file._id) } });
//     await dirs.deleteMany({ _id: { $in: dirsData.map((dir) => dir._id) } });

//     if (parentDirData.parentDirId !== null) {
//       await dirs.deleteOne({ _id: new ObjectId(dirId) });
//       return res.status(200).json({ msg: `Dir ${parentDirData.name} deleted` });
//     }
//     res.status(200).json({ msg: "Root Directory emptied" });
//   } catch (error: any) {
//     if (error.code == "ENOENT") {
//       console.error(error);
//       res.status(404).json({ msg: `File not found` });
//     } else {
//       res.status(500).json({ msg: "SERIOUS FAILURE FROM DELETE DIR API" });
//     }
//   }
// };
