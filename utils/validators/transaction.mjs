import {body} from 'express-validator';

const validateTransaction = [
    body('cash').notEmpty().withMessage('Cash wajib diisi'),
    body('grand_total').notEmpty().withMessage('Grand Total wajib diisi'),
];

export {validateTransaction};