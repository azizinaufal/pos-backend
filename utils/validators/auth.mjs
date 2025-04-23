import {body} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const validateLogin = [
    body('email').isEmail().notEmpty().withMessage('Email harus diisi'),
    body('password').isLength({min:6}).withMessage('Password minimal harus berisi 6 karakter'),
];

export {validateLogin};