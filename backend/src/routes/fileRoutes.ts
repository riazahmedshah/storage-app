import { Router } from "express"
import { open, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import filesDB from "../filesDB.json" with {type:'json'}
import dirDb from "../directoriesDB.json" with {type: 'json'};
import { dirEntry, fileEntry} from "../types/index.js"
import {getPublicPath, getSrcPath} from "../utils/pathHelper.js";

const router:Router = Router();

const filesData = filesDB as fileEntry[];
const dirsData = dirDb as dirEntry[];

// CREATE
router.post("/:filename", async(req, res) => {
  const {filename} = req.params;
  const parentDirId = req.header("parentDirId") || dirsData[0]?.id;

  if(!filename) return res.status(404).json({msg:"Filename is missing"});
  if (!parentDirId) {
    return res.status(400).send("Missing Parent Directory ID");
  }
  const ext = path.extname(filename);
  const fileID = crypto.randomUUID();

  const targetPath = getPublicPath(fileID);

  try {
    const fileHandle = await open(`${targetPath}${ext}`, 'w');
    const writeStream = fileHandle.createWriteStream();

    req.pipe(writeStream);

    writeStream.on('error', (err) => {
      console.error('WriteStream Error', err);
      res.status(400).json({msg:'Failed to write file'});
    });

    writeStream.on('finish', async() => {
      filesData.push({
        name: filename, 
        id:fileID,
        ext,
        parentDirId
      });

      const parentDirData = dirsData.find((dir) => dir.id === parentDirId);
      parentDirData?.files.push(fileID);
      console.log(`File: ${filename} Uploaded successfully`);
      const srcPath = getSrcPath();
      await writeFile(`${srcPath}/filesDB.json`, JSON.stringify(filesData, null, 2));
      await writeFile(`${srcPath}/directoriesDB.json`, JSON.stringify(dirsData, null, 2));
    });



    res.status(200).json({msg:`File ${filename} created successfully`});
  } catch (error:any) {
    if(error.code == 'ENOENT'){
      console.error(error)
      res.status(404).json({msg:`File ${filename} not found`});
    }else{
      console.error(error);
      res.status(500).json({ msg: "An internal error occurred" });
    }
  }
});

// READ
router.get('{/:id}', (req, res) => {
  const { id } = req.params;
  const srcPath = getSrcPath();

  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).send("File not found");
  }

  if(req.query.action === 'download'){
    res.set('Content-Dispositon', 'attachment');
  }
  res.sendFile(`${srcPath}/public/${id}${fileData?.ext}`);
});

// UPADATE
router.patch("/:id", async(req, res) => {
  const {id} = req.params // 64113323-d41f-4af1-bd6f-697c70c22319
  const {newFileName} = req.body;

  const targetPath = getPublicPath();
  const srcPath = getSrcPath()

  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).send("File not found");
  }
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
  const publicPath = getPublicPath();
  const srcPath = getSrcPath();

  const fileIdx = filesData.findIndex((file) => file.id === id);
  const fileData = filesData[fileIdx];
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
