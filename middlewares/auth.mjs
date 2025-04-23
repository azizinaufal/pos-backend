import express from 'express';
import jwt from 'jsonwebtoken';

const verifyToken = (req,res,next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({message:'Tidak terautentikasi'});
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if(err){
            return res.status(401).json({message:"Token tidak valid"});
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,

        };

        next();
    });
};

export {verifyToken};
