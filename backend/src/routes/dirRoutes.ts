import { Router } from "express"
import { writeFile } from "node:fs/promises";
import dirDb from "../directoriesDB.json" with {type: 'json'};
import filesDB from "../filesDB.json" with {type: 'json'};
import { dirEntry, fileEntry} from "../types/index.js"
import { getSrcPath } from "../utils/pathHelper.js";

const router: Router = Router();



const filesData = filesDB as fileEntry[];
const dirsData = dirDb as dirEntry[];


router.get("{/:id}", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    const root = dirsData[0]!;
    const filesInfo = root.files.map((fileId) => {
      return filesData.find((file) => file.id === fileId)
    });
    res.json({...root, files:filesInfo});
  } else {
    const dirData = dirsData.map((dir) => dir.id === id);
    res.json(dirData);
  }
});

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

export default router;