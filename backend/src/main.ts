import express, { Request } from "express";
import { open, opendir, rename } from "node:fs/promises";
import path from "node:path";
const app = express();
const PORT =  4000;


app.use(express.json());

app.get("/allfiles{/*dirName}", async(req:Request<{dirName: string[]}>,res) => {
  const {dirName} = req.params;
  const dirPath = dirName?.join('/')
  const targetPath = path.join(`${import.meta.dirname}/public`, dirPath ?? "");
  try {
    const info = await opendir(targetPath);
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

app.post("/trash/:filename", async(req, res) => {
  const {filename} = req.params;

  try {
    await rename(
      `${import.meta.dirname}/public/${filename}`,
      `${import.meta.dirname}/trash/${filename}`
    );
    res.status(200).json({
      msg:`File ${filename} Deleted successfully`
    });
  } catch (error:any) {
    if(error.code == 'ENOENT'){
      console.error(error);
      res.status(404).json({msg:`File ${filename} not found`});
    }else{
      res.status(500).json({ msg: "An internal error occurred in trash API" });
    }
  }
});

app.post("/createFile", async(req, res) => {
  const filename = req.header("filename");
  if(!filename) return res.status(404).json({msg:"Filename is missing"});
  try {
    const fileHandle = await open(filename, 'w');

    const writeStream = fileHandle.createWriteStream();
    res.pipe(writeStream);

    writeStream.on('error', (err) => {
      console.error('WriteStream Error', err);
      res.status(400).json({msg:'Failed to write file'});
    });

    writeStream.on('finish', () => {
      console.log(`File: ${filename} Uploaded successfully`);
    })
  } catch (error) {
    
  }
})

app.patch("/rename/:filename", async(req, res) => {
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
      res.status(404).json({msg:`File ${filename} not found`});
    }else{
      console.error(error);
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