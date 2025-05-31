import bcrypt from 'bcryptjs';

import {PrismaClient} from '@prisma/client';


const prisma = new PrismaClient();

const registerUser = async (req,res)=>{
    try {
        const existingUser = await prisma.user.findFirst({
           where:{
               email:req.body.email,
           }
        });

        if(existingUser){
            return res.status(400).json({
                meta:{
                    success:false,
                    message:"Pengguna dengan email tersebut sudah ada"
                }

            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const regisUser = await prisma.user.create({
            data:{
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
            }
        });

        const {password, ...userTanpaPassword} = regisUser;

        res.status(200).json({
           meta:{
               success:true,
               message:"Pendaftaran Berhasil dilakukan",
           },
            data:userTanpaPassword,
        });

    }catch(err){
        return res.status(500).json({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server",
           },
            error:err.message || String(err)
        });
    }
};

const registerController = {registerUser};
export {registerController};