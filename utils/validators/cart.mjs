import {body} from 'express-validator';

const validateCart = [
    body('product_id').notEmpty().withMessage('Produk wajib diisi'),
    body('qty').notEmpty().withMessage('Jumlah wajib diisi'),
];

export {validateCart};