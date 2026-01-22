import { Document, model, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name:string;
  email:string;
  password:string;
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
  password:{
    type:String,
    required:true,
    trim:true,
  },
  rootDirId:{
    type:Schema.Types.ObjectId,
    required:true
  }
},{
  timestamps: true,
  versionKey: false
});

export const User = model<IUser>("User", userSchema);