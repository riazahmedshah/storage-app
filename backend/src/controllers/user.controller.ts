import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";

import { User } from "../models/user.model.js";
import { Directory } from "../models/directory.model.js";
import { AppError } from "../utils/AppError.js";
import { error } from "node:console";

export const createUser = async (
  req:Request,
  res:Response,
  next:NextFunction
) => {
  const { name, email, password } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw new AppError("This email is already registered.", 409);
    }

    const userId = new mongoose.Types.ObjectId();
    const rootDirId = new mongoose.Types.ObjectId();
    const newUser = new User({
      _id: userId,
      name,
      email,
      password,
      rootDirId,
    });

  await newUser.save({ session });

  const newDir = new Directory({
    _id: rootDirId,
    name: `root-${email}`,
    userId,
    parentDirId: null
  });

  await newDir.save({ session });

    await session.commitTransaction();
    res.status(201).json({ msg: "User Created successfully" });
  } catch (error:any) {
    if(session.inTransaction()){
      await session.abortTransaction();
    }
    next(error);
  } finally {
    await session.endSession();
  }
}

export const login = async (
  req:Request,
  res:Response,
  next:NextFunction
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password){
      throw new AppError("Invalid credentials", 401);
    }
    const { password: _p, ...userSafe } = user.toObject();
    res.cookie("uid", user._id.toString(), {
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({ userSafe });
  } catch(error) {
    next(error)
  }
}

export const getUser = async (
  req:Request,
  res:Response
) => {
  const { name, email } = req.user;
  res.status(200).json({ name, email });
}
export const logout = async (
  req:Request,
  res:Response
) => {
  res.clearCookie("uid");
}