import express from 'express';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
import {randomInvoice} from "../utils/generateRandomInvoice.mjs";

const createTransaction = async (req, res) => {
  const userId = req.user?.id;
    const { customer_id, cash, discount, grand_total } = req.body;

  try {

      const transaction = await prisma.$transaction(async (tx) => {
         const carts = await tx.cart.findMany({
             where:{
                 cashier_id:userId,
             },
             include: {
                 product: true
             },
         }) ;

         if(carts.length===0){
             throw new Error("Keranjang belanja masih kosong");
         }

         const newTransaction = await tx.transaction.create({
            data:{
                cashier_id:userId,
                customer_id:customer_id?parseInt(customer_id):null,
                invoice:randomInvoice(),
                cash:parseFloat(cash),
                change:parseFloat(cash)-parseFloat(grand_total),
                discount:discount?parseFloat(discount):0,
                grand_total: parseFloat(grand_total),
            }
         });


         for (const cart of carts){
             if(cart.product.stock < cart.qty){
                 throw new Error(`Stok produk ${cart.product.title} tidak mencukupi. Sisa stok: ${cart.product.stock}`);
             }

             await tx.transactionDetail.create({
                 data:{
                     transaction_id: newTransaction.id,
                     product_id:cart.product.id,
                     qty:cart.qty,
                     price:cart.price,
                 }
             });

             const profitPerItem = (cart.product.sell_price - cart.product.buy_price) *cart.qty;
             if(profitPerItem>0){
                 await tx.profit.create({
                     data:{
                         transaction_id: newTransaction.id,
                         total:profitPerItem,
                         user_id:userId,
                     }
                 });
             }

             await tx.product.update({
                where:{
                    id: cart.product.id,
                },
                 data:{
                    stock: {
                        decrement:cart.qty
                    }
                 },
             });
         }
         await tx.cart.deleteMany({
            where:{
                cashier_id:userId,
            }
         });
          return newTransaction;
      });
      const stockWarnings = [];
            res.status(200).send({
               meta:{
                   success:true,
                   message: `Transaksi berhasil dibuat`
               },
                data:transaction,
                warnings: stockWarnings.length > 0 ? stockWarnings : undefined,
            });

  }catch (err){
        res.status(500).send({
           meta:{
               success:false,
               message: `Terjadi kesalahan di server`
           } ,
            error: err.message || String(err)
        });
  }
};

//FIND TRANSACTION BY INVOICE
const findTransactionByInvoice = async (req, res) => {
  const {invoice}=req.query;
    const userId = req.user?.id;
    if (!invoice) {
        return res.status(400).send({
            meta: {
                success: false,
                message: "Invoice harus disertakan dalam query parameter",
            },
        });
    }
  try {
      const transaction = await prisma.transaction.findFirst({
         where:{
             invoice : invoice,
             cashier_id : userId,
         },
          select:{
            id:true,
            cashier_id:true,
            customer_id:true,
            invoice:true,
            cash:true,
            change:true,
            discount:true,
            grand_total:true,
            created_at:true,
              customer:{
                select:{
                    name:true
                },
              },
              cashier:{
                select:{
                    name:true,
                    created_at:true,
                    updated_at:true
                },
              },
              transaction_details:{
                select:{
                    id:true,
                    product_id:true,
                    qty:true,
                    price:true,
                    product:{
                        select:{
                              title:true,
                        },
                    },
                },
              },
          },
      });

      if(!transaction){
          return res.status(404).send({
             meta:{
                 success:false,
                 message: `Transaksi dengan invoice: ${invoice} tidak ditemukan`
             },
          });
      }

      res.status(200).send({
         meta:{
             success:true,
             message:`Berhasil mendapatkan transaksi dengan invoice ${invoice}`
         },
          data:transaction,
      });
  }catch(err){
        res.status(500).send({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server"
           } ,
            error: err.message || String(err)
        });
  }
};

const transactionController = {createTransaction, findTransactionByInvoice};
export {transactionController};