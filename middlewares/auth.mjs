import express from 'express';
import jwt from 'jsonwebtoken';

const verifyToken = (req,res,next)=>{
    const token = req.headers['authorization'];
    if(!token){
        return res.status(401).json({message:'Tidak terautentikasi'});
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).json({message:"Token tidak valid"});
        }else {
            req.userId = decoded.id;
            next();
        }
    });
};

export default verifyToken;
