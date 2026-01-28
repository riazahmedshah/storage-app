import { Buffer } from "node:buffer";
import { NextFunction, Request, Response } from "express";

import { User } from "../models/user.model.js";
import { createHash, timingSafeEqual } from "node:crypto";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "No authentication cookie found" });
  }
  const [base64Payload, signature] = token.split(".");
  const cookiePayload = JSON.parse(
    Buffer.from(base64Payload, "base64url").toString(),
  );

  // console.log(cookiePayload, signature);
  const verifyCookie = createHash("sha256")
    .update(JSON.stringify(cookiePayload))
    .update(process.env.SECRET!)
    .digest('base64url');

  if(verifyCookie !== signature){
    return res.status(401).json({ error: "Bad Cookie, chala ja BSDK..." });
  }

  // return res.send("Okkk");

  // console.log(id, expiry);
  if (new Date() > new Date(parseInt(cookiePayload.expiry, 16) * 1000)) {
    res.clearCookie("token");
    return res.status(401).json({
      success: false,
      message: "Token is expired",
    });
  }
  const isUserExists = await User.findById(cookiePayload.id).lean();

  if (isUserExists) {
    req.user = isUserExists;
    return next();
  }
  return res.status(401).json({ error: "Unauthorised" });
}
