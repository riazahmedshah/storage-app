import express from "express";

import dirRoutes from "./routes/dirRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
const app = express();

const PORT =  4000;


app.use(express.json());

app.use('/dir', dirRoutes);
app.use('/file', fileRoutes);


app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
})