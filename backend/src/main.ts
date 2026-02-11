import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import dirRoutes from "./routes/dirRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { authMiddleware } from "./middleware/auth.js";
import { connectDB } from "./configs/db.js";
import { errorHandler } from "./utils/errorHandler.js";
import { authRouter } from "./routes/authRoutes.js";
const app = express();

const PORT = 4000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))
app.use(express.json());
app.use(cookieParser(process.env.SECRET));

app.use("/api/dirs", authMiddleware, dirRoutes);
app.use("/api/files", authMiddleware, fileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRouter);

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