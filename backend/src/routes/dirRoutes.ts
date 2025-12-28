import { Request, Router } from "express"
import { mkdir } from "node:fs/promises";
import path from "node:path";
import dirDb from "../directoriesDB.json" with {type: 'json'};
import filesDB from "../filesDB.json" with {type: 'json'};
import { dirEntry, fileEntry} from "../types/index.js"

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

router.post("{/*folderpath}", async (req: Request<{ folderpath: string[] }>, res) => {
  const { folderpath } = req.params;
  const fullpath = path.join('/', folderpath?.join('/'))
  const targetPath = path.join(`${process.cwd()}/src/public/`, fullpath ?? "");
  try {
    await mkdir(targetPath, { recursive: false });
    res.status(200).json({ msg: "Directory created." })
  } catch (error: any) {
    if (error.code === 'EEXIST') {
      res.status(409).json({ msg: `Directory ${fullpath} Already Exists` })
    } else {
      console.error(error);
      res.status(500).json({ msg: "Error in Dir API" });
    }
  }
});

export default router;