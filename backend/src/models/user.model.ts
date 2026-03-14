import { model, Schema, Types } from "mongoose";

export interface IUser {
  _id:Types.ObjectId;
  name:string;
  email:string;
  profileImage:string;
  rootDirId: Types.ObjectId;
  role: 'USER' | 'ADMIN' | 'MANAGER'
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name:{
    type:String,
    required: true,
    minLength: 2,
    trim:true
  },
  email:{
    type:String,
    required:true,
    lowercase:true,
    trim:true
  },
  profileImage:{
    type:String
  },
  rootDirId:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:'Directory'
  },
  role:{
    type:String,
    enum:["ADMIN","USER","MANAGER"],
    default: 'USER'
  }
},{
  timestamps: true,
  versionKey: false
});

export const User = model<IUser>("User", userSchema);