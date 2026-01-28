import express from "express";
import cookieParser from "cookie-parser";

import dirRoutes from "./routes/dirRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { authMiddleware } from "./middleware/auth.js";
import { connectDB } from "./configs/db.js";
import { errorHandler } from "./utils/errorHandler.js";
const app = express();

const PORT = 4000;

app.use(express.json());
app.use(cookieParser(process.env.SECRET));

app.use("/dirs", authMiddleware, dirRoutes);
app.use("/files", authMiddleware, fileRoutes);
app.use("/users", userRoutes);

app.use(errorHandler);

connectDB()
  .then(() => {
    console.log(`DB connection established!`);
    app.listen(PORT, () => {
      console.log(`server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });