// import { Request, Response } from "express";
// import { open, rm } from "node:fs/promises";
// import path from "node:path";
// import { pipeline } from "node:stream/promises";

// import { ObjectId } from "mongodb";

// import { getPublicPath, getSrcPath } from "../utils/pathHelper.js";
// import { fileAccessCheck } from "../utils/fileAccessCheck.js";
// import { Dirs, Files } from "../configs/collections.js";

// export const createFile = async(
//   req:Request,
//   res:Response
// ) => {
//   const { rootDirId } = req.user;
//     const parentDirId = req.params.parentDirId || rootDirId;
//     const filename = req.header("filename");
//     const files = Files();
//     const dirs = Dirs();
//     if (!filename) return res.status(404).json({ msg: "Filename is missing" });
//     const ext = path.extname(filename);
//     try {
//       const fileParentDir = await dirs.findOne({_id: new ObjectId(parentDirId)});
//       if(!fileParentDir) return res.status(404).json({msg:"This does'n make sense"});
//       const isFileAccessible = await fileAccessCheck(
//         res,
//         new ObjectId(parentDirId),
//         fileParentDir.userId,
//         { msg: "Not Authorized to Create file in this Parent Directory." }
//       );
  
//       if(!isFileAccessible) return;
//       const file = await files.insertOne({
//         name: filename,
//         ext,
//         parentDirId: new ObjectId(parentDirId)
//       });
  
//       const targetPath = getPublicPath(file.insertedId.toString());
  
//       const fileHandle = await open(`${targetPath}${ext}`, "w");
//       const writeStream = fileHandle.createWriteStream();
  
//       await pipeline(req, writeStream);
//       res.status(200).json({ msg: `File ${filename} created successfully` });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ msg: "Upload failed!" });
//     }
// };

// export const getFile = async(
//   req:Request,
//   res:Response
// ) => {
//   const { _id: userId } = req.user;
//     const { fileId } = req.params;
//     const srcPath = getSrcPath();
//     const files = Files();
  
//     const fileData = await files.findOne({ _id: new ObjectId(fileId) });
//     if (!fileData) {
//       return res.status(404).send("File not found");
//     }
//     const isFileAccessible = await fileAccessCheck(
//       res,
//       fileData.parentDirId,
//       userId,
//       { msg: "Not Authorized to access this file." }
//     );
//     if (!isFileAccessible) return;
  
//     if (req.query.action === "download") {
//       res.set("Content-Dispositon", "attachment");
//     }
//     res.sendFile(`${srcPath}/public/${fileId}${fileData.ext}`);
// };

// export const updateFile = async(
//   req:Request,
//   res:Response
// ) => {
//   const { fileId } = req.params;
//     const { _id: userId } = req.user;
//     const { newFilename } = req.body;
//     const files = Files();
  
//     try {
//       const fileData = await files.findOne({ _id: new ObjectId(fileId) });
//       if (!fileData) {
//         return res.status(404).send("File not found");
//       }
//       const isFileAccessible = await fileAccessCheck(
//         res,
//         fileData.parentDirId,
//         userId,
//         { msg: "Not Authorized to UPDATE this file." }
//       );
//       if (!isFileAccessible) return;
//       await files.updateOne(
//         { _id: new ObjectId(fileId) },
//         { $set: { name: `${newFilename}${fileData.ext}` } }
//       );
  
//       res.status(200).json({
//         msg: `File Renamed successfully to ${newFilename}${fileData.ext}`,
//       });
//     } catch (error: any) {
//       console.error(error);
//       res.status(500).json({ msg: "An internal error occurred" });
//     }
// };
// export const deleteFile = async(
//   req:Request,
//   res:Response
// ) => {
//   const { id } = req.params;
//   const { _id: userId } = req.user;
//   const publicPath = getPublicPath();
//   const srcPath = getSrcPath();
//   const files = Files();
//   try {
//     const fileData = await files.findOne({ _id: new ObjectId(id) });
//     if (!fileData) {
//       return res.status(404).send("File not found");
//     }
//     const isFileAccessible = await fileAccessCheck(
//       res,
//       fileData.parentDirId,
//       userId,
//       { msg: "Not Authorized to DELETE this file." }
//     );
//     if (!isFileAccessible) return;
//     await rm(`${publicPath}/${id}${fileData.ext}`);

//     await files.deleteOne({ _id: new ObjectId(id) });

//     res.status(200).json({
//       msg: `File ${fileData?.name} Deleted successfully`,
//     });
//   } catch (error: any) {
//     if (error.code == "ENOENT") {
//       console.error(error);
//       res.status(404).json({ msg: `File not found` });
//     } else {
//       res.status(500).json({ msg: "An internal error occurred in delete API" });
//     }
//   }
// };