import { Request, Router } from "express"
import { mkdir, opendir } from "node:fs/promises";
import path from "node:path";

const router:Router = Router();

router.get("{/*dirName}", async(req:Request<{dirName: string[]}>,res) => {
  const {dirName} = req.params;
  const dirPath = dirName && path.join('/', dirName?.join('/'))
  const targetPath = path.join(`${process.cwd()}/src/public`, dirPath ?? "");
  try {
    const info = await opendir(targetPath);
    const filesData = [];
    for await (const data of info){
      const file = {
        name: data.name,
        isDirectory: data.isDirectory()
      }
      filesData.push(file)
    };

    res.status(200).json(filesData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "An internal error occurred" });
  }
});

router.post("{/*folderpath}", async(req:Request<{folderpath: string[]}>, res) => {
  const { folderpath } = req.params;
  const fullpath = path.join('/', folderpath?.join('/'))
  const targetPath = path.join(`${process.cwd()}/src/public/`, fullpath ?? "");
  try {
    await mkdir(targetPath, {recursive:false});
    res.status(200).json({msg:"Directory created."})
  } catch (error:any) {
    if(error.code === 'EEXIST'){
      res.status(409).json({msg:`Directory ${fullpath} Already Exists`})
    }else{
      console.error(error);
      res.status(500).json({msg:"Error in Dir API"});
    }
  }
});

export default router;