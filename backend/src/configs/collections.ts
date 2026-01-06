import { Directory, File, User } from "../types/dbTypes.js";
import { getDB } from "./db.js";

export const Users = () => getDB().collection<User>("users");

export const Dirs = () => getDB().collection<Directory>("directories");

export const Files = () => getDB().collection<File>("files");
