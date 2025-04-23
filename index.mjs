import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import {router} from "./routes/index.mjs";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api',router);
const port=3000;

app.get('/',(req,res)=>{
    res.send(`Hello World!`);
});

app.get('/upload/:filename', (req,res)=>{
    res.sendFile(path.join(__dirname,'uploads',req.params.filename));
});

app.listen(port,()=>{
    console.log(`server started on port ${port}`);
});