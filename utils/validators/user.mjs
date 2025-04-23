import {body} from 'express-validator';
import  {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

const validateUser = [
    body('name').notEmpty().withMessage('Nama wajib diisi'),
    body('email')
        .notEmpty().withMessage('Email wajib diisi')
        .isEmail().withMessage('Email tidak valid')
        .custom(async(value, {req})=>{
            if(!value){
                throw new Error('Email wajib diisi');
            }

            const user  = await prisma.user.findFirst({
                where: {
                    email: value,
                    NOT:{
                        id: Number(req.params.id) || undefined
                    }
                }
            });

            if(user){
                throw new Error('Email sudah ada');
            }
            return true;
        }),

    body('password').if((value,{req})=>req.method==='POST')
        .notEmpty().withMessage('Password wajib diisi')
        .isLength({min:6}).withMessage('Password minimal berisi 6 karakter'),
    body('password')
        .if((value, { req }) => req.method === 'PUT')
        .optional()
        .isLength({ min: 6 }).withMessage('Password minimal berisi 6 karakter')
];

export {validateUser};