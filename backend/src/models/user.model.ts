import { model, Schema, Types } from "mongoose";

export interface IUser {
  name:string;
  email:string;
  profileImage:string;
  rootDirId: Types.ObjectId;
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
  }
},{
  timestamps: true,
  versionKey: false
});

export const User = model<IUser>("User", userSchema);