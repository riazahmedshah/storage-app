import { Router } from "express";
import userDB from "../userDB.json" with {type: 'json'}
import dirDb from "../directoriesDB.json" with {type: 'json'}
import { dirEntry, userEntry } from "../types/index.js";
import { writeFile } from "node:fs/promises";
import { getSrcPath } from "../utils/pathHelper.js";

const router: Router = Router();

const usersData = userDB as userEntry[];
const dirsData = dirDb as dirEntry[];

router.post("/register", async(req, res) => {
  const {name, email, password} = req.body;
  const userId = crypto.randomUUID();
  const rootDirId = crypto.randomUUID();
  const srcPath = getSrcPath();
  try {
    const newUser = {id:userId, name, email,password,rootDirId}
    const newRootDir = {
      id: rootDirId,
      userId,
      parentDirId:null,
      name: `root-${email}`,
      files:[],
      directories:[]
    }
    await Promise.all([
      writeFile(`${srcPath}/userDB.json`, JSON.stringify([...usersData, newUser], null, 2)),
      writeFile(`${srcPath}/directoriesDB.json`, JSON.stringify([...dirsData, newRootDir], null, 2))
    ])
    res.status(201).json({msg:"User Created successfully"})
  } catch (error) {
    res.status(500).json({msg:"Something went wrong"})
  }

});

router.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = usersData.find((usr) => usr.email === email);
  if(!user) return res.status(404).json({msg:"Email not found!"});
  if(user.password === password){
    const {password, ...userSafe} = user;
    res.status(200).json({userSafe});
  } else{
    res.status(400).json({msg:"No user found"});
  }
})

export default router;