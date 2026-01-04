import { Response } from "express";
import dirDb from "../directoriesDB.json" with {type: 'json'};
import { dirEntry } from "../types/index.js";

const dirsData = dirDb as dirEntry[];

export function fileAccessCheck(
  res:Response, parentDirId:string, 
  userId:string, 
  message: Record<string,string>): boolean{
  const fileParentDir = dirsData.find((dir) => dir.id === parentDirId);
  if(!fileParentDir || fileParentDir.userId !== userId){
    res.status(401).json(message);
    return false
  };

  return true;
}