import { Document, WithId } from "mongodb"
import { User } from "../../db/schema.ts"


declare global{
  namespace Express{
    interface Request {
      user:{
        user: User,
        rootDirectoryId: string | null
      }
    }
  }
}
export{}