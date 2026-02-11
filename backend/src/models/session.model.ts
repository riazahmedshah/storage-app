import { Document, model, Schema, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  userId:{
    type:Schema.Types.ObjectId,
    required: true,
    ref:'User'
  },

  createdAt:{
    type: Date,
    default: Date.now,
    expires: 60
  }
});

export const Session = model<ISession>("Session", sessionSchema);