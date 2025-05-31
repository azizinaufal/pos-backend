import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import {router} from "./routes/index.mjs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api',router);
const port=3000;

app.get('/',(req,res)=>{
    res.send(`Hello World!`);
});

app.get('/upload/:filename', (req,res)=>{
    res.sendFile(path.join(__dirname,'uploads',req.params.filename));
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File terlalu besar. Maksimum 5MB.' });
        }
        return res.status(400).json({ message: err.message });
    }
    // error handler lain atau default handler
    next(err);
});

app.listen(port,()=>{
    console.log(`server started on port ${port}`);
});