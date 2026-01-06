import { Router } from "express";
import { ObjectId } from "mongodb";

import { authMiddleware } from "../middleware/auth.js";
import { Dirs, Users } from "../configs/collections.js";
import { client } from "../configs/db.js";

const router: Router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const dirs = Dirs();
  const users = Users();

  const session = client.startSession();
  try {
    session.startTransaction();

    const existingUser = await users.findOne({ email }, { session });
    if (existingUser) {
      console.log(existingUser);
      await session.abortTransaction();
      return res.status(409).json({ msg: "Try using different email." });
    }

    const userId = new ObjectId();
    const rootDirId = new ObjectId();
    await users.insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId,
      },
      { session }
    );

    await dirs.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        userId,
        parentDirId: null
      },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ msg: "User Created successfully" });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    res.status(500).json({ msg: "Something went wrong" });
  } finally {
    await session.endSession();
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = Users();
    const user = await users.findOne({ email });
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
});

router.get("/", authMiddleware, (req, res) => {
  const { name, email } = req.user;

  res.status(200).json({ name, email });
});

router.post("/logout", (req, res) => {
  res.clearCookie("uid");
});

export default router;