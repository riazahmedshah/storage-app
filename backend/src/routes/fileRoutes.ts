import { Router } from "express"
import { open, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import filesDB from "../filesDB.json" with {type:'json'}
import dirDb from "../directoriesDB.json" with {type: 'json'};
import { dirEntry, fileEntry} from "../types/index.js"
import {getPublicPath, getSrcPath} from "../utils/pathHelper.js";
import { fileAccessCheck } from "../utils/fileAccessCheck.js";
import { pipeline } from "node:stream/promises";

const router:Router = Router();

const filesData = filesDB as fileEntry[];
const dirsData = dirDb as dirEntry[];

// CREATE
router.post("{/:parentDirId}", async(req, res) => {
  const {rootDirId} = req.user
  const parentDirId = req.params.parentDirId || rootDirId;
  const filename = req.header("filename");

  if(!filename) return res.status(404).json({msg:"Filename is missing"});
  if (!parentDirId) {
    return res.status(400).send("Missing Parent Directory ID");
  }
  const ext = path.extname(filename);
  const fileID = crypto.randomUUID();

  const targetPath = getPublicPath(fileID);
  const srcPath = getSrcPath();
  try {
    const fileHandle = await open(`${targetPath}${ext}`, 'w');
    const writeStream = fileHandle.createWriteStream();

    await pipeline(req, writeStream)
    req.pipe(writeStream);

    const newFile = { name: filename, id:fileID, ext, parentDirId }
    const parentDirData = dirsData.find((dir) => dir.id === parentDirId);
    parentDirData?.files.push(fileID);
    
    await Promise.all([
      writeFile(`${srcPath}/filesDB.json`, JSON.stringify([...filesData, newFile], null, 2)),
      writeFile(`${srcPath}/directoriesDB.json`, JSON.stringify(dirsData, null, 2))
    ]);
    res.status(200).json({msg:`File ${filename} created successfully`});
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Upload failed!" });
  }
});

// READ
router.get('/:id', (req, res) => {
  const {id:userId} = req.user
  const { id } = req.params;
  const srcPath = getSrcPath();

  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).send("File not found");
  }
  const isFileAccessible = fileAccessCheck(res, userId, fileData.parentDirId, 
    {msg:"Not Authorized to access this file."}
  );
  if (!isFileAccessible) return;

  if(req.query.action === 'download'){
    res.set('Content-Dispositon', 'attachment');
  }
  res.sendFile(`${srcPath}/public/${id}${fileData.ext}`);
});

// UPADATE
router.patch("/:id", async(req, res) => {
  const {id} = req.params 
  const {id:userId} = req.user;
  const {newFileName} = req.body;

  const targetPath = getPublicPath();
  const srcPath = getSrcPath()

  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).send("File not found");
  }
  const isFileAccessible = fileAccessCheck(res, userId, fileData.parentDirId, 
    {msg:"Not Authorized to UPDATE this file."}
  );
  if (!isFileAccessible) return;
  try {
    fileData.name = `${newFileName}${fileData.ext}`;
    await writeFile(`${srcPath}/filesDB.json`, JSON.stringify(filesData, null, 2));
  
    res.status(200).json({
      msg:`File Renamed successfully to ${newFileName}${fileData.ext}`
    });
  } catch (error:any) {
    if(error.code == 'ENOENT'){
      res.status(404).json({msg:`File ${targetPath} not found`});
    }else{
      console.error(error);
      res.status(500).json({ msg: "An internal error occurred" });
    }
  }
});

// DELETE
router.delete("/:id", async(req, res) => {
  const {id} = req.params;
  const {id:userId} = req.user;
  const publicPath = getPublicPath();
  const srcPath = getSrcPath();

  const fileIdx = filesData.findIndex((file) => file.id === id);
  const fileData = filesData[fileIdx];
  if (!fileData) {
    return res.status(404).send("File not found");
  }
  const isFileAccessible = fileAccessCheck(res, userId, fileData.parentDirId, 
    {msg:"Not Authorized to DELETE this file."}
  );
  if (!isFileAccessible) return;
  try {
    await rm(
      `${publicPath}/${id}${fileData?.ext}`
    );

    filesData.splice(fileIdx, 1);
    const parentDirData = dirsData.find((dir) => dir.id === fileData?.parentDirId)!;
    parentDirData.files = parentDirData?.files.filter((fileId) => fileId !== id);

    await writeFile(`${srcPath}/filesDB.json`, JSON.stringify(filesData, null, 2));
    await writeFile(`${srcPath}/directoriesDB.json`, JSON.stringify(dirsData, null, 2));
    res.status(200).json({
      msg:`File ${fileData?.name} Deleted successfully`
    });
  } catch (error:any) {
    if(error.code == 'ENOENT'){
      console.error(error);
      res.status(404).json({msg:`File ${fileData?.name} not found`});
    }else{
      res.status(500).json({ msg: "An internal error occurred in trash API" });
    }
  }
});

export default router