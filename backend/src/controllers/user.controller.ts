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
import { loginUserInput, RegisterUserInput } from "../validators/user.validators.js";
import { UserRepository } from "../repositories/user.repository.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
      let sessionID = await checkSession(existingUser._id);
      if(!sessionID){ 
        sessionID = await createSession(existingUser._id);
      }
      const base64String = toBase64(sessionID)
      res.cookie("token", base64String, {
        maxAge: 1000*60*60*24*7,
        signed: true,
        httpOnly: true
      });
      return res.status(200).json({ data: existingUser });
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

export const getAllUsers = async(req:Request, res:Response, next:NextFunction) => {
  try {
    const users = await User.find().lean();
    if(!users) throw new AppError("Error finding users", 404);
    const allSessions = await Session.find().lean();

    const allSessionsUsersId = allSessions.map(({userId}) => userId.toString());

    const allSessionsUsersIdSet = new Set(allSessionsUsersId);

    const transformedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      isLoggedIn: allSessionsUsersIdSet.has(user._id.toString())
    }))

    res.status(200).json(transformedUsers);
  } catch (error) {
    next(error)
  }
}

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

const userRepository = new UserRepository();

export const register = asyncHandler(
  async (req: Request<{}, {}, RegisterUserInput>, res: Response) => {
    const body = req.body;
    const existingUser = await userRepository.findUserByEmail(body.email);
    if (existingUser) {
      throw new AppError("This email is already registered.", 409);
    }

    const user = await userRepository.cretaeUser(body);

    return ResponseHandler.success(res, 201, "USER_CREATED_SUCCESSFULLY", user);
  }
);

export const login = asyncHandler(
  async (req:Request<{}, {}, loginUserInput>, res:Response) => {
    const body = req.body;
    const user = await userRepository.findUserByEmail(body.email);

    if(!user) throw new AppError("User not found", 404);

    res.cookie("uid", user.id);

    return ResponseHandler.success(res, 200, "LogedIn successfully")
  }
)


// export const login = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       throw new AppError("No user found", 404);
//     }

//     // const isPasswordMatch = await bcrypt.compare(password, user.password);
//     // if (!isPasswordMatch) {
//     //   throw new AppError("Invalid credentials", 401);
//     // }
//     // const { password: _p, ...userSafe } = user.toObject();

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
//     res.status(200).json({ user });
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

export const logoutNotByUser = async(req:Request, res:Response) => {
  const isPermisibble = ["ADMIN","MANAGER"];
  const { userId } = req.params;
  const user = req.user; // logout krne wala.
  if(!isPermisibble.includes(user.role)) throw new AppError("You have no permission to do this", 403);

  const userToLogout = await User.findById(userId).lean();
  if(!userToLogout) throw new AppError("User to logout not found", 404);

  if(userToLogout.role === 'ADMIN' && user.role === 'MANAGER' ){
    throw new AppError("You cannot logout the ADMIN", 403);
  }

  const userToLogoutSession = await Session.findOne({userId}).select('_id').lean();
  if(!userToLogoutSession) throw new AppError("User is Already lougged out!", 404);

  await Session.deleteOne({_id: userToLogoutSession._id});

  res.status(200).json({msg: "Loggin out seccessfully."});
}

export const deleteNotByUser  = async (req:Request, res:Response) => {
  const isPermisibble = ["ADMIN","MANAGER"];
  const { userId } = req.params;
  const user = req.user; // logout krne wala.
  if(!isPermisibble.includes(user.role)) throw new AppError("You have no permission to do this", 403);

  const userToDelete = await User.findById(userId).lean();
  if(!userToDelete) throw new AppError("User to delete not found", 404);

  if(userToDelete.role === 'ADMIN' && user.role === 'MANAGER' ){
    throw new AppError("You cannot delete the ADMIN", 403);
  }

  if(userToDelete.role === user.role ){
    throw new AppError("You cannot delete your self", 403);
  }

  

  res.send("Okkk")
}

// export const logoutFromAllDevices = async (req: Request, res: Response) => {
//   await Session.deleteMany({ userId: req.user._id });
// };
