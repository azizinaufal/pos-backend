import {body , check} from "express-validator";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const validateProduct = [
    body('barcode')
        .notEmpty().withMessage('Barcode wajib diisi')
        .custom(async (value, {req})=>{
            const existingProduct = await prisma.findFirst({
                where: {barcode:barcode},
            });
            if (existingProduct && (!req.params.id || !existingProduct.id !==parseInt(req.params.id, ))) {
                throw new Error('Barcode harus unik dan tidak boleh sama')
            }
            return true;
        }),
    body('category').notEmpty().withMessage('Kategori wajib diiisi'),
    body('title').notEmpty().withMessage('Judul Produk wajib diisi'),
    body('description').notEmpty().withMessage('Deskripsi wajib diisi'),
    check('image').custom((value, {req})=>{
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
    body('buy_price').notEmpty().withMessage('Harga beli wajib diisi'),
    body('sell_price').notEmpty().withMessage('Harga jual wajib diisi'),
    body('stock').notEmpty().withMessage('Stok jual wajib diisi')
];

export {validateProduct};