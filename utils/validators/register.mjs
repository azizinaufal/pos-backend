import {body} from "express-validator";
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

const validateRegister = [
    body('email').notEmpty().isEmail().withMessage('Email wajib diisi').custom(async (email) => {
        const existingUser = await prisma.user.findFirst({ where: { email } });
        if (existingUser) {
            throw new Error('Email sudah terdaftar');
        }
    }),
    body('password').notEmpty().isLength({min:6}).withMessage('Password minimal harus berisi 6 karakter'),
   body('name').notEmpty().withMessage('Nama wajib diisi')
];

export {validateRegister};