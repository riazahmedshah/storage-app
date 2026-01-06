import { Router } from "express";
import { Dirs, Files } from "../configs/collections.js";
import { ObjectId } from "mongodb";

const router: Router = Router();

// CREATE
router.post("{/:dirParentId}", async (req, res) => {
  const { _id, rootDirId } = req.user;
  const dirname = req.header("dirname") || "New Folder";
  const dirParentId: string = req.params.dirParentId || rootDirId.toString();
  const dirs = Dirs();
  try {
    const parentDir = await dirs.findOne({ _id: new ObjectId(dirParentId) });
    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    if (parentDir.userId.toString() !== _id?.toString()) {
      return res.status(404).json({ message: "Chala ja BSDK..." });
    }

    await dirs.insertOne({
      name: dirname,
      userId: _id,
      parentDirId: new ObjectId(dirParentId),
    });

    res.status(201).json({ msg: "Directory created." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error in Dir API" });
  }
});

// READ
router.get("{/:dirId}", async (req, res) => {
  const { dirId } = req.params;
  const { _id: userId, rootDirId } = req.user;
  const dirs = Dirs();
  const files = Files();
  try {
    const userRootDir = await dirs.findOne({ _id: rootDirId });
    const dirData = dirId
      ? await dirs.findOne({ _id: new ObjectId(dirId) })
      : userRootDir;
    if (!dirData)
      return res.status(404).json({ message: "Directory not found!" });

    if (dirData.userId.toString() !== userId?.toString()) {
      return res.status(401).json({ message: "You don't have permission!" });
    }
    // const filesInfo = await files.find({_id: {$in:dirData.files}}).toArray();
    const filesInfo: never[] = [];
    const dirsInfo = await dirs
      .find({ parentDirId: new ObjectId(dirId) })
      .toArray();
    res.json({ ...dirData, files: filesInfo, directories: dirsInfo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mes: "ERROR in get dir api" });
  }
});

// UPDATE
router.patch("/:dirId", async (req, res) => {
  const { dirId } = req.params;
  const { _id: userId } = req.user;
  const { newDirName } = req.body;
  const dirs = Dirs();

  try {
    const result = await dirs.updateOne(
      { _id: new ObjectId(dirId), userId: userId },
      { $set: { name: newDirName } }
    );
    if (!result.acknowledged)
      return res.status(400).json({ msg: "Error in update DB DirName api" });
    res.status(200).json({ mag: "Renamed successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error in update DirName api" });
  }
});

// DELETE
// router.delete("/:dirId", async (req, res) => {
//   const { dirId } = req.params;
//   const {_id:userId} = req.user
//   const dirs = Dirs();
//   const publicPath = getPublicPath();
//   const srcPath = getSrcPath();

//   try {
//   const dirData = await dirs.findOne({_id: new ObjectId(dirId)});
//   if(!dirData) return res.status(404).json({message: "Directory not found!"});
//   if(dirData.userId !== userId) return res.status(401).json({ message: "You don't have permission!" });

//     dirData.files.map((fileId) => {
//       filesData.map(async (file) => {
//         if (file.id === fileId) {
//           await rm(`${publicPath}/${fileId}${file.ext}`);
//         }
//       });
//       filesData = filesData?.filter((file) => file.id !== fileId);
//       // dirData.files = dirData.files.filter((id) => id !== fileId);
//     });

//     dirData?.directories.map((dirId) => {
//       dirsData = dirsData?.filter((dir) => dir.id !== dirId);
//     });

//     const parentDir = dirsData.find(
//       (parentdir) => parentdir.id === dirData?.parentDirId
//     )!;
//     dirsData = dirsData.filter((dir) => dir.id !== id);
//     parentDir.directories = parentDir?.directories.filter(
//       (chileId) => chileId !== id
//     );

//     await writeFile(
//       `${srcPath}/filesDB.json`,
//       JSON.stringify(filesData, null, 2)
//     );
//     await writeFile(
//       `${srcPath}/directoriesDB.json`,
//       JSON.stringify(dirsData, null, 2)
//     );
//     res.status(200).json({
//       msg: `Dir ${dirData?.name} Deleted successfully`,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ msg: "SERIOUS FAILURE FROM DELETE DIR API" });
//   }
// });

export default router;
