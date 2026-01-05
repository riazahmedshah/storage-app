import { Document, WithId } from "mongodb"

declare global{
  namespace Express{
    interface Request {
      user:WithId<Document>
    }
  }
}
export{}