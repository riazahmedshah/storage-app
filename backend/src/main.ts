import express from "express";
import cookieParser from "cookie-parser"

import dirRoutes from "./routes/dirRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import { authMiddleware } from "./middleware/auth.js";
const app = express();

const PORT =  4000;


app.use(express.json());
app.use(cookieParser());

app.use('/dirs', authMiddleware, dirRoutes);
app.use('/files', authMiddleware, fileRoutes);
app.use('/users', userRoutes);


app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
})