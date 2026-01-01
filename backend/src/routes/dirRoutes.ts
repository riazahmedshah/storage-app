import { Router } from "express"
import { rm, writeFile } from "node:fs/promises";
import dirDb from "../directoriesDB.json" with {type: 'json'};
import filesDB from "../filesDB.json" with {type: 'json'};
import { dirEntry, fileEntry} from "../types/index.js"
import { getPublicPath, getSrcPath } from "../utils/pathHelper.js";

const router: Router = Router();



let filesData = filesDB as fileEntry[];
let dirsData = dirDb as dirEntry[];

// CREATE
router.post("{/:dirParentId}", async (req, res) => {
  const { dirParentId } = req.params || dirsData[0]?.id;
  const {dirName} = req.body;
  const srcPath = getSrcPath();
  const id = crypto.randomUUID();

  const parentDir = dirsData.find((dir) => dir.id === dirParentId);
  parentDir?.directories.push(id);

  dirsData.push({
    id,
    name:dirName,
    parentDirId:dirParentId,
    files:[],
    directories:[]
  });
  try {
    await writeFile(`${srcPath}/directoriesDB.json`, JSON.stringify(dirsData, null, 2));
    res.status(200).json({ msg: "Directory created." })
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error in Dir API" });
  }
});

// READ
 router.get("{/:id}", async (req, res) => {
  const { id } = req.params;
  const dirData = id ? dirsData.find((dir) => dir.id === id) : dirsData[0];
  
  const filesInfo = dirData?.files.map((fileId) => filesData.find((file) => file.id === fileId));

  const dirsInfo = dirData?.directories.map((dirId) => dirsData.find((dir) => dir.id === dirId))
  
  res.json({ ...dirData, files: filesInfo, directories: dirsInfo });
});

// UPDATE
router.patch("/:dirId", async(req, res) => {
  const { dirId } = req.params;
  const {newDirName} = req.body;
  const srcPath = getSrcPath();

  const dirData = dirsData?.find((dir) => dir.id === dirId)!;
  dirData.name = newDirName;
  try {
    await writeFile(`${srcPath}/directoriesDB.json`, JSON.stringify(dirsData, null, 2));
    res.status(200).json({mag:"Renamed successfully!"})
  } catch (error) {
    console.log(error);
    res.status(500).json({msg:"Error in update DirName api"})
  }
})

// DELETE
router.delete("/:id", async(req, res) => {
  const {id} = req.params;
  const publicPath = getPublicPath();
  const srcPath = getSrcPath();

  const dirData = dirsData.find((dir) => dir.id === id);

  try {
    dirData?.files.map((fileId) => {
      filesData.map(async (file) => {
        if(file.id === fileId){
          await rm(`${publicPath}/${fileId}${file.ext}`)
        }
      });
      filesData = filesData?.filter((file) => file.id !== fileId);
      // dirData.files = dirData.files.filter((id) => id !== fileId);
    });
  
    dirData?.directories.map((dirId) => {
      dirsData = dirsData?.filter((dir) => dir.id !== dirId);
    });
  
    const parentDir = dirsData.find((parentdir) => parentdir.id === dirData?.parentDirId)!;
    dirsData = dirsData.filter((dir) => dir.id !== id);
    parentDir.directories = parentDir?.directories.filter((chileId) => chileId !== id);


    await writeFile(`${srcPath}/filesDB.json`, JSON.stringify(filesData, null, 2));
    await writeFile(`${srcPath}/directoriesDB.json`, JSON.stringify(dirsData, null, 2));
    res.status(200).json({
      msg:`Dir ${dirData?.name} Deleted successfully`
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({msg:"SERIOUS FAILURE FROM DELETE DIR API"});
  }
})



export default router;