import { Buffer } from "node:buffer";
import { NextFunction, Request, Response } from "express";

import { User } from "../models/user.model.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { token } = req.signedCookies;
  if (!token) {
    return res.status(401).json({ error: "No authentication cookie found" });
  }
  const {id, expiry} = JSON.parse(
    Buffer.from(token, "base64url").toString(),
  );
  
  // console.log(id, expiry);
  if (new Date() > new Date(parseInt(expiry, 16) * 1000)) {
    res.clearCookie("token");
    return res.status(401).json({
      success: false,
      message: "Token is expired",
    });
  }
  const isUserExists = await User.findById(id).lean();

  if (isUserExists) {
    req.user = isUserExists;
    return next();
  }
  return res.status(401).json({ error: "Unauthorised" });
}
