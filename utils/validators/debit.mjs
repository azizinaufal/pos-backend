import {body} from "express-validator";
import Prisma, {PrismaClient} from "@prisma/client";
const prisma  = new PrismaClient();

export const validateDebit = [
    body('supplier_id').notEmpty().withMessage('Supplier Wajib diisi')
        .custom(async (supplier_id,{req})=>{
            const supplier = await prisma.supplier.findFirst({
                where:{
                    id:parseInt(supplier_id), user_id:req.user.id
                }
            });
            if(!supplier){
                throw new Error('Supplier tidak ditemukan');
            }
            return true;
        }),
    body('grand_total').notEmpty().withMessage("Grand total wajib diisi dan harus berupa angka."),
    body('items').isArray({min:1}).withMessage("Harus ada minimal 1 produk dalam pembelian"),
    body('items.*.product_id').notEmpty().withMessage("ID produk tidak boleh kosong"),
    body('items.*.qty').notEmpty().isInt({gt:0}).withMessage("Jumlah harus lebih dari 0"),
    body('items.*.price').notEmpty().isFloat({gt:0}).withMessage("Harga Beli harus lebih dari 0"),
]

