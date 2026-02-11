import { Buffer } from "node:buffer";

import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

import { User } from "../models/user.model.js";
import { Directory } from "../models/directory.model.js";
import { AppError } from "../utils/AppError.js";
import { Session } from "../models/session.model.js";
import { verifyToken } from "../configs/oAuth.js";
import { checkSession, createSession, toBase64 } from "../utils/session.js";

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ msg: "Token not found" });
  }
  const transaction = await mongoose.startSession();
  try {
    const userData = await verifyToken(token);
    if (!userData) throw new AppError("Invalid token", 401);
    const {email, name, picture} = userData;

    const existingUser = await User.findOne({ email }).select('_id')

    if(existingUser){
      const session = await checkSession(existingUser._id);
      if(!session){ 
        const sessionID = await createSession(existingUser._id);
        const base64String = toBase64(sessionID)
        res.cookie("token", base64String, {
          maxAge: 1000*60*60*24*7,
          signed: true
        });
        return res.status(200).json({ data: existingUser });
      }
    } else{
      transaction.startTransaction();
      
      const userId = new mongoose.Types.ObjectId();
      const rootDirId = new mongoose.Types.ObjectId();
      const newUser = new User({
        _id: userId,
        name,
        email,
        profileImage: picture,
        rootDirId,
      });

      await newUser.save({session: transaction});

      const newDir = new Directory({
        _id: rootDirId,
        name: `root-${email}`,
        userId,
        parentDirId: null,
      });

      await newDir.save({ session: transaction });

      const sessionID = await createSession(newUser._id);
      const base64String = toBase64(sessionID)
      res.cookie("token", base64String, {
        maxAge: 1000*60*60*24*7,
        signed: true
      });

      await transaction.commitTransaction();
      res.status(201).json({ msg: "User Created successfully!" });
    }
  } catch (error) {
    if (transaction.inTransaction()) {
      await transaction.abortTransaction();
    }
    next(error);
  } finally {
    await transaction.endSession()
  }

};

// export const createUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { name, email, password } = req.body;
//   const session = await mongoose.startSession();
//   try {
//     session.startTransaction();

//     const existingUser = await User.findOne({ email }).session(session);
//     if (existingUser) {
//       throw new AppError("This email is already registered.", 409);
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const userId = new mongoose.Types.ObjectId();
//     const rootDirId = new mongoose.Types.ObjectId();
//     const newUser = new User({
//       _id: userId,
//       name,
//       email,
//       password: hashedPassword,
//       rootDirId,
//     });

//     await newUser.save({ session });

//     const newDir = new Directory({
//       _id: rootDirId,
//       name: `root-${email}`,
//       userId,
//       parentDirId: null,
//     });

//     await newDir.save({ session });

//     await session.commitTransaction();
//     res.status(201).json({ msg: "User Created successfully" });
//   } catch (error: any) {
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }
//     next(error);
//   } finally {
//     await session.endSession();
//   }
// };

// export const login = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       throw new AppError("No user found", 404);
//     }

//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       throw new AppError("Invalid credentials", 401);
//     }
//     const { password: _p, ...userSafe } = user.toObject();

//     const sessionCount = await Session.find({ userId: user._id }).lean();

//     if (sessionCount.length >= 2) {
//       await sessionCount[0]?.deleteOne();
//     }

//     const session = await Session.create({
//       userId: user._id,
//     });

//     const base64Cookie = Buffer.from(session.id).toString("base64url");
//     res.cookie("token", base64Cookie, {
//       signed: true,
//       maxAge: 60 * 60 * 1000 * 7 * 24,
//     });
//     res.status(200).json({ userSafe });
//   } catch (error) {
//     next(error);
//   }
// };

export const getUser = async (req: Request, res: Response) => {
  const { name, email } = req.user;
  res.status(200).json({ name, email });
};
export const logout = async (req: Request, res: Response) => {
  const { token } = req.signedCookies;
  const sessionId = Buffer.from(token, "base64url").toString();
  await Session.findByIdAndDelete(sessionId);
  res.clearCookie("uid");
};

// export const logoutFromAllDevices = async (req: Request, res: Response) => {
//   await Session.deleteMany({ userId: req.user._id });
// };
