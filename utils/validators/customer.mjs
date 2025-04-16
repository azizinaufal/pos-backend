import {body} from 'express-validator';

const validateCustomer = [
    body('name').notEmpty().withMessage('Nama wajib diisi'),
    body('no_telp').notEmpty().withMessage('Nomor Telepon wajib diisi'),
    body('address').notEmpty().withMessage('Alamat wajib diisi'),
];

export {validateCustomer};