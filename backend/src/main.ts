import express from "express";
import { opendir, rename } from "node:fs/promises";
const app = express();
const PORT =  4000;


app.use(express.json());

app.get("/allfiles", async(req,res) => {
  try {
    const info = await opendir(`${import.meta.dirname}/public`);
    const filesData = [];
    for await (const data of info){
      const file = {
        name: data.name,
        isDirectory: data.isDirectory()
      }
      filesData.push(file)
    };

    res.status(200).json(filesData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "An internal error occurred" });
  }
});


app.patch("rename/:filename", async(req, res) => {
  const {filename} = req.params
  const {newFileName} = req.body;

  try {
    await rename(
      `${import.meta.dirname}/public/${filename}`, 
      `${import.meta.dirname}/public/${newFileName}`
    );

    res.status(200).json({
      msg:`File Renamed successfully from ${filename} to ${newFileName}`
    });
  } catch (error:any) {
    if(error.code == 'ENOENT'){
      console.error(error);
      res.status(404).json({msg:`File ${filename} not found`});
    }else{
      res.status(500).json({ msg: "An internal error occurred" });
    }
  }
});

app.get('/:filename', (req, res) => {
  const { filename } = req.params;

  res.sendFile(`${import.meta.dirname}/public/${filename}`);
})


app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
})