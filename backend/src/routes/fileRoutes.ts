import { Request, Router } from "express"
import { open, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import filesDB from "../filesDB.json" with {type:'json'}


import {getPublicPath, getSrcPath} from "../utils/pathHelper.js";

const router:Router = Router();

interface fileEntry{
  id:string;
  name:string;
  ext:string;
}

const filesData = filesDB as fileEntry[];

router.post("/trash{/*filename}", async(req:Request<{filename: string[]}>, res) => {
  const {filename} = req.params;
  const filePath = filename.join("/");
  const targetPath = path.join("/", filePath);
  try {
    await rename(
      `${process.cwd()}/src/public/${targetPath}`,
      `${process.cwd()}/src/trash/${targetPath}`
    );
    res.status(200).json({
      msg:`File ${filename} Deleted successfully`
    });
  } catch (error:any) {
    if(error.code == 'ENOENT'){
      console.error(error);
      res.status(404).json({msg:`File ${filename} not found`});
    }else{
      res.status(500).json({ msg: "An internal error occurred in trash API" });
    }
  }
});

router.post("/:filename", async(req, res) => {
  const {filename} = req.params;
  if(!filename) return res.status(404).json({msg:"Filename is missing"});
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
        ext
      });
      console.log(`File: ${filename} Uploaded successfully`);
      const srcPath = getSrcPath();
     await writeFile(`${srcPath}/filesDB.json`, JSON.stringify(filesData));
     console.log(filesData); 
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

router.patch("/rename{/*filename}", async(req:Request<{filename: string[]}>, res) => {
  const {filename} = req.params
  const {newFileName} = req.body;

  const dirPath = filename.join("/");
  const targetPath = path.join("/", dirPath);
  const renameTarget = `src/public/${path.dirname(dirPath)}/${newFileName}`

  try {
    await rename(
      `${process.cwd()}/src/public${targetPath}`, 
      `${process.cwd()}/${renameTarget}`
    );

    res.status(200).json({
      msg:`File Renamed successfully from ${filename} to ${newFileName}`
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

router.get('{/:id}', (req, res) => {
  const { id } = req.params;
  const srcPath = getSrcPath();
  const fileData = filesData.find((file) => file.id === id);
 //  console.log(fileData);
 //  console.log(srcPath);
  if(req.query.action === 'download'){
    res.set('Content-Dispositon', 'attachment');
  }
  res.sendFile(`${srcPath}/public/${id}${fileData?.ext}`);
});

export default router
