import {query} from 'express-validator';

const validatorSales = [
    query('start_date')
        .notEmpty().withMessage('Tanggal awal wajib diisi')
        .isISO8601().withMessage('Tanggal awal harus valid'),
    query('end_date')
        .notEmpty().withMessage('Tanggal akhir wajib diisi')
        .isISO8601().withMessage('Tanggal akhir harus valid'),
];

export {validatorSales};