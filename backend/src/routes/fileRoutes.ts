import { Request, Router } from "express"
import { open, rename } from "node:fs/promises";
import path from "node:path";

const router:Router = Router();

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

// TODO: handle proper paths...
router.post("/new-file{/*filename}", async(req, res) => {
  const filename = req.header("filename");
  if(!filename) return res.status(404).json({msg:"Filename is missing"});
  try {
    const fileHandle = await open(`${import.meta.dirname}/public/${filename}`, 'w');

    const writeStream = fileHandle.createWriteStream();
    res.pipe(writeStream);

    writeStream.on('error', (err) => {
      console.error('WriteStream Error', err);
      res.status(400).json({msg:'Failed to write file'});
    });

    writeStream.on('finish', () => {
      console.log(`File: ${filename} Uploaded successfully`);
    });

    res.status(200).json({msg:`File ${filename} created successfully`});
  } catch (error:any) {
    if(error.code == 'ENOENT'){
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

router.get('{/*filename}', (req:Request<{filename:string[]}>, res) => {
  const { filename } = req.params;
  const pathToFile = filename.join("/");
  const targetPath = path.join("/", pathToFile);

  res.sendFile(`${process.cwd()}/src/public/${targetPath}`);
});

export default router;
