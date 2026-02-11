import mongoose from "mongoose";
import { connectDB } from "./db.js";

const applySchemaValidation = async () => {
  await connectDB()
  if (!mongoose.connection.db) {
    throw new Error("Database connection not established yet.");
  }

  try {
    await Promise.all([
      mongoose.connection.db.command({
        collMod: "users",
        validator: {
          $jsonSchema: {
            required: ["_id", "name", "email", "profileImage", "rootDirId"],
            properties: {
              _id: {
                bsonType: "objectId",
                description: "_id must be a valid ObjectId",
              },
              name: {
                bsonType: "string",
                minLength: 3,
                description: "Name must be a string with at least 3 characters",
              },
              email: {
                bsonType: "string",
                pattern: "^[\\w.-]+@([\\w-]+\\.)+[\\w-]{2,4}$",
                description: "Email must be in valid format",
              },
              profileImage: {
                bsonType: "string"
              },
              rootDirId: {
                bsonType: "objectId",
                description: "rootDirId must be a valid ObjectId",
              },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" }
            },
            additionalProperties: false,
          },
        },
        validationAction: "error",
        validationLevel: "strict",
      }),
      mongoose.connection.db.command({
        collMod: "directories",
        validator: {
          $jsonSchema: {
            required: ["_id", "name", "userId", "parentDirId"],
            properties: {
              _id: {
                bsonType: "objectId",
                description: "_id must be a valid ObjectId",
              },
              name: {
                bsonType: "string",
                description: "Name must be a string",
              },
              userId: {
                bsonType: "objectId",
                description: "userId must be a valid ObjectId",
              },
              parentDirId: {
                bsonType: ["objectId", "null"],
                description: "ParentDirId must be a valid ObjectId",
              },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" }
            },
            additionalProperties: false,
          },
        },
        validationAction: "error",
        validationLevel: "strict",
      }),
      mongoose.connection.db.command({
        collMod: "files",
        validator: {
          $jsonSchema: {
            required: ["_id", "name", "ext", "parentDirId"],
            properties: {
              _id: {
                bsonType: "objectId",
                description: "_id must be a valid ObjectId",
              },
              name: {
                bsonType: "string",
                description: "Name must be a string",
              },
              ext: {
                bsonType: "string",
                description: "ext must be a string",
              },
              parentDirId: {
                bsonType: "objectId",
                description: "ParentDirId must be a valid ObjectId",
              },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" }
            },
            additionalProperties: false,
          },
        },
        validationAction: "error",
        validationLevel: "strict",
      }),
    ]);
    console.log("Database-level validation updated!");
  } catch (error) {
    console.error("Failed to apply collMod:", error);
  } finally{
    await mongoose.connection.close();
  }
};


await applySchemaValidation();