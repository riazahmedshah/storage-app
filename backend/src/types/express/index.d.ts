import { Db } from "mongodb"
import { userEntry } from "../index.js"

declare global{
  namespace Express{
    interface Request {
      user:userEntry
    }
  }
}
export{}