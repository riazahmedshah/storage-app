import { NextFunction, Request, Response } from "express";

import userDB from "../userDB.json" with {type: 'json'}
import { userEntry } from "../types/index.js";

const usersData = userDB as userEntry[];

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { uid } = req.cookies;

  if (!uid) {
    return res.status(401).json({ error: "No authentication cookie found" });
  }

  const isUserExists = usersData.find((user) => user.id === uid);

  if (isUserExists) {

    return next();
  } 
  return res.status(401).json({ error: "Unauthorised" });
}