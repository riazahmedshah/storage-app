import { client, connectDB } from "./db.js";

const db = await connectDB();

await Promise.all([
  db.command({
    collMod: "users",
    validator: {
      $jsonSchema: {
        required: ["_id", "name", "email", "password", "rootDirId"],
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
          password: {
            bsonType: "string",
            minLength: 6,
            maxLength: 6,
            description: "Password must be a string with at 6 characters",
          },
          rootDirId: {
            bsonType: "objectId",
            description: "rootDirId must be a valid ObjectId",
          },
        },
        additionalProperties: false,
      },
    },
    validationAction: "error",
    validationLevel: "moderate"
  }),
  db.command({
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
            description: "userId must be a valid ObjectId"
          },
          ParentDirId: {
            bsonType: "objectId",
            description: "ParentDirId must be a valid ObjectId",
          },
        },
        additionalProperties: false,
      },
    },
    validationAction: "error",
    validationLevel: "strict"
  }),
  db.command({
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
            description: "ext must be a string"
          },
          ParentDirId: {
            bsonType: "objectId",
            description: "ParentDirId must be a valid ObjectId",
          },
        },
        additionalProperties: false,
      },
    },
    validationAction: "error",
    validationLevel: "strict"
  })
]);

await client.close();
