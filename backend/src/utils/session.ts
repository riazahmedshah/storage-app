import { Buffer } from "node:buffer";
import { Types } from "mongoose";
import { Session } from "../models/session.model.js";

export const createSession = async (userId: string | Types.ObjectId):Promise<string> => {
  const session = await Session.create({
    userId,
  });

  return session.id;
};

export const checkSession = async (userId: string | Types.ObjectId):Promise<string | null> => {
  const session = await Session.exists({userId, createdAt: {$gt: new Date()}});
  if(!session) return null;
  return session._id.toString();
}

export const toBase64 = (id:string): string => {
  return Buffer.from(id).toString('base64url');
}