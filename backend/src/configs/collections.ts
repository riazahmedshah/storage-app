import { getDB } from "./db.js";

export const User = () => getDB().collection("users");

export const Dirs = () => getDB().collection("directories");

export const Files = () => getDB().collection("files");
