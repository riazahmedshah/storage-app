import { MongoClient, Db } from "mongodb";

export const client = new MongoClient("mongodb://127.0.0.1:27017/vfs");

let db: Db;

export async function connectDB() {
  if (db) return db;

  await client.connect();
  db = client.db(); // uses "vfs" from URI
  console.log("MongoDB connected");
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error("DB not initialized!!");
  }
  return db;
}

process.on("SIGINT", async () => {
  console.log("Mongo client disconnected!");
  await client.close();
  process.exit(0);
});
