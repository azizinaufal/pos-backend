import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const port=3000;

app.get('/',(req,res)=>{
    res.send(`Hello World!`);
});

app.listen(port,()=>{
    console.log(`server started on port ${port}`);
})