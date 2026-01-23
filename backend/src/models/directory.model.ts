import { Document, model, Schema, Types } from "mongoose"

export interface IDirectory extends Document {
  name: string;
  userId: Types.ObjectId;
  parentDirId:Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
} 

const directorySchema = new Schema<IDirectory>({
  name:{
    type: String,
    required: true,
    trim: true
  },
  userId:{
    type: Schema.Types.ObjectId,
    required: true,
    ref:'User'
  },
  parentDirId: {
    type: Schema.Types.ObjectId,
    ref:'Directory'
  }
},{
  timestamps: true,
  versionKey: false
});

export const Directory = model<IDirectory>('Directory', directorySchema);