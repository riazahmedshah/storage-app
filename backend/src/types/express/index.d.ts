import { Document, WithId } from "mongodb"
import { User } from "../dbTypes.ts"

declare global{
  namespace Express{
    interface Request {
      user:User
    }
  }
}
export{}