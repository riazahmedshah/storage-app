import { Buffer } from "node:buffer";
import { NextFunction, Request, Response } from "express";

import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { AppError } from "../utils/AppError.js";
import { UserRepository } from "../repositories/user.repository.js";


const userRepository = new UserRepository();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // const { token } = req.signedCookies;
  const { uid } = req.cookies;
  if (!uid) {
    return res.status(401).json({ error: "No authentication cookie found" });
  }

  // const sessionId = Buffer.from(token, "base64url").toString();

  // const isSessionExists = await Session.findById(sessionId);
  // if(!isSessionExists){
  //   throw new AppError("No session found!",401)
  // }

  const isUserExists = await userRepository.getUserWithRootDirId(uid);
    
  if (isUserExists) {
    req.user = isUserExists;
    return next();
  }
  return res.status(401).json({ error: "Unauthorised" });
}
