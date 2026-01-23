import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";

import { User } from "../models/user.model.js";
import { Directory } from "../models/directory.model.js";
import { AppError } from "../utils/AppError.js";

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
      if (error.code === 121 && error.errInfo?.details) {
      console.log("--- VALIDATION FAILED ---");
      // This prints the whole nested object properly
      console.dir(error.errInfo.details, { depth: null, colors: true });
      
      // Specifically looking for the rules that failed
      const schemaErrors = error.errInfo.details.schemaRulesNotSatisfied;
      console.log("Failing Rules:", JSON.stringify(schemaErrors, null, 2));
    } else {
      console.log(error);
    }
    next(error);
  } finally {
    await session.endSession();
  }
}

export const login = async (
  req:Request,
  res:Response
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(404).json({ msg: "Invalid credentials" });
    console.log(user);
    const { password: _p, ...userSafe } = user;
    res.cookie("uid", user._id.toString(), {
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({ userSafe });
  } catch {
    res.status(500).json({ msg: "Something went wrong: LOGIN" });
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