import { ObjectId } from "mongodb";

export interface Directory{
  _id?: ObjectId;
  name: string;
  userId: ObjectId;
  parentDirId: ObjectId | null;
  files: ObjectId[];
  directories: ObjectId[];
};

export interface File{
  _id?:ObjectId;
  name:string;
  ext:string;
  parentDirId: ObjectId;
};

export interface User{
  _id?:ObjectId;
  rootDirId:ObjectId;
  name:string;
  email:string;
  password:string;
}