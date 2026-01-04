import { Router } from "express";
import userDB from "../userDB.json" with {type: 'json'}
import dirDb from "../directoriesDB.json" with {type: 'json'}
import { dirEntry, userEntry } from "../types/index.js";
import { writeFile } from "node:fs/promises";
import { getSrcPath } from "../utils/pathHelper.js";
import { authMiddleware } from "../middleware/auth.js";

const router: Router = Router();

const usersData = userDB as userEntry[];
const dirsData = dirDb as dirEntry[];

router.post("/register", async(req, res) => {
  const {name, email, password} = req.body;
  const isUserExists = userDB.find((user) => user.email === email);
  if(isUserExists){
    return res.status(409).json({msg:"Try using different email."})
  }
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
  if(!user || user.password !== password) return res.status(404).json({msg:"Invalid credentials"});
  try{
    const {password, ...userSafe} = user;
    res.cookie('uid', user.id, {
      maxAge: 60*60*1000
    });
    res.status(200).json({userSafe});
  } catch{
    res.status(500).json({msg:"Something went wrong: LOGIN"});
  }
});

router.get("/", authMiddleware, (req, res) => {
  const {name, email} = req.user;

  res.status(200).json({name, email});
});

router.post("/logout", (req, res) => {
  res.clearCookie("uid");
});

export default router;