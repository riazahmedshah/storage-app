import express from "express";
const app = express();
const PORT =  4000;


app.get('/:filename', (req, res) => {
  const { filename } = req.params;

  res.sendFile(`${import.meta.dirname}/public/${filename}`);
})


app.get("/", (req, res) => {
  res.send("Hi from Healthy, server");
})


app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
})