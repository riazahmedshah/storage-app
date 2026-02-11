import { Document, WithId } from "mongodb"
import { IUser } from "../../models/user.model.ts"


declare global{
  namespace Express{
    interface Request {
      user:IUser
    }
  }
}
export{}