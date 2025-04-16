import {body,check} from 'express-validator';

const validateCategory = [
    body('name')
        .notEmpty().withMessage('Nama Wajib Diisi'),
    check('image')
        .optional()
        .custom((value,{req})=>{
            if(req.method === 'POST' && !req.file){
                throw new Error('Gambar wajib diisi');
            }
            if (req.file) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(req.file.mimetype)) {
                    throw new Error('Format gambar tidak valid (jpeg, png, webp)');
                }
            }
            return true;
        }),
    body('description')
        .notEmpty().withMessage('Deskripsi wajib diisi'),
];
export  {validateCategory};

