import mongoose from "mongoose";

export async function connectDB() {
  try {
    const client = await mongoose.connect("mongodb://127.0.0.1:27017/vfs",{
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family:4
    });
  
    console.log(`MongoDB Connected: ${client.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed!');
  process.exit(0);
});