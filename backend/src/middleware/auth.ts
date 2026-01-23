import { NextFunction, Request, Response } from "express";

import { ObjectId } from "mongodb";
import { User } from "../models/user.model.js";


export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { uid } = req.cookies;
  if (!uid) {
    return res.status(401).json({ error: "No authentication cookie found" });
  }

  const isUserExists = await User.findOne({_id: new ObjectId(uid)});

  if (isUserExists) {
    req.user = isUserExists;
    return next();
  } 
  return res.status(401).json({ error: "Unauthorised" });
}