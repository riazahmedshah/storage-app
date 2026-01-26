import { Document, model, Schema, Types } from "mongoose";

export interface IFile extends Document{
  name:string;
  ext:string;
  parentDirId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const fileSchema = new Schema<IFile>({
  name:{
    type:String,
    required: true,
    minLength: 2,
    trim:true
  },
  ext:{
    type:String,
    required: true,
    trim:true
  },
  parentDirId:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:'Directory'
  }
},{
  timestamps: true,
  versionKey: false
});

export const File = model<IFile>("File", fileSchema);