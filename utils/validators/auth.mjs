import {body} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const validateLogin = [
    body('email').isEmail().notEmpty().withMessage('Email wajib diisi'),
    body('password').isLength({min:6}).withMessage('Password minimal harus berisi 6 karakter'),
];

const validateUpdateUser = [
    body('email')
        .optional()
        .isEmail()
        .withMessage('Format email tidak valid'),

    body('name')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('Nama tidak boleh kosong'),

    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password minimal 6 karakter'),
];


export {validateLogin,validateUpdateUser};