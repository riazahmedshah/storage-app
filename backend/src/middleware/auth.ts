import { NextFunction, Request, Response } from "express";

import { Users } from "../configs/collections.js";
import { ObjectId } from "mongodb";


export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { uid } = req.cookies;
  const users = Users();
  if (!uid) {
    return res.status(401).json({ error: "No authentication cookie found" });
  }

  const isUserExists = await users.findOne({_id: new ObjectId(uid)});

  if (isUserExists) {
    req.user = isUserExists;
    return next();
  } 
  return res.status(401).json({ error: "Unauthorised" });
}