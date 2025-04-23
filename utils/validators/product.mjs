import {body , check} from "express-validator";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const validateProduct = [
    body('barcode')
        .notEmpty().withMessage('Barcode wajib diisi')
        .custom(async (barcode, {req})=>{
            const existingProduct = await prisma.product.findFirst({
                where: {barcode:barcode},
            });
            if (existingProduct && (!req.params.id || existingProduct.id !==parseInt(req.params.id, ))) {
                throw new Error('Barcode harus unik dan tidak boleh sama')
            }
            return true;
        }),
    body('category_id')
        .notEmpty().withMessage('Kategori wajib diisi')
        .custom(async (category_id, { req }) => {
            const category = await prisma.category.findFirst({
                where: {
                    id: parseInt(category_id),
                    user_id: req.user.id,
                },
            });
            if (!category) {
                throw new Error('Kategori tidak ditemukan atau bukan milik Anda');
            }
            return true;
        }),
    body('title').notEmpty().withMessage('Judul Produk wajib diisi'),
    body('description').notEmpty().withMessage('Deskripsi wajib diisi'),
    check('image')
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
    body('buy_price').notEmpty().withMessage('Harga beli wajib diisi'),
    body('sell_price').notEmpty().withMessage('Harga jual wajib diisi'),
    body('stock').notEmpty().withMessage('Stok jual wajib diisi')
];

export {validateProduct};