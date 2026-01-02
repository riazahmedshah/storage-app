import express from "express";

import dirRoutes from "./routes/dirRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
import userRoutes from "./routes/userRoutes.js"
const app = express();

const PORT =  4000;


app.use(express.json());

app.use('/dirs', dirRoutes);
app.use('/files', fileRoutes);
app.use('/users', userRoutes);


app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
})