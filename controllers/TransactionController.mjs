import express from 'express';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
import {randomInvoice} from "../utils/generateRandomInvoice.mjs";

const createTransaction = async (req, res) => {
  const userId = req.user?.id;

  try {
      const invoice = randomInvoice();

      const cashierId = userId;
      const customerId = parseInt(req.body.customer_id) || null;
      const cash = parseInt(req.body.cash);
      const change = parseInt(req.body.change);
      const discount = parseInt(req.body.discount);
      const grandTotal = parseInt(req.body.grand_total);

      if(isNaN(customerId) || isNaN(cash) || isNaN(change) || isNaN(discount) || isNaN(grandTotal) ) {
            res.status(400).send({
               meta:{
                   success:false,
                   message:`Data input tidak valid, Silahkan periksa kembali dan pastikan berupa angka`,
               },
            });
      }

      const transaction = await prisma.transaction.create({
         data:{
             cashier_id : cashierId,
             customer_id : customerId,
             invoice : invoice,
             cash : cash,
             change : change,
             discount : discount,
             grand_total : grandTotal,
         },
      });

      const carts = await prisma.cart.findMany({
         where:{
             cashier_id: cashierId,
         },
          include:{
             product: true,
          },
      });
      const stockWarnings = [];

      for(const cart of carts) {
          const price = parseFloat(cart.price);

          if (cart.product.user_id !== userId) {
              return res.status(403).send({
                  meta: {
                      success: false,
                      message: `Akses ditolak. Produk dalam keranjang bukan milik pengguna ini.`,
                  },
              });
          }


          await prisma.transactionDetail.create({
              data: {
                  transaction_id: transaction.id,
                  product_id: cart.product_id,
                  qty: cart.qty,
                  price: price,
              },
          });

          const totalBuyPrice = cart.product.buy_price * cart.qty;
          const totalSellPrice = cart.product.sell_price * cart.qty;
          const profits = totalSellPrice - totalBuyPrice;

          await prisma.profit.create({
              data: {
                  transaction_id: transaction.id,
                  total: profits,
                  user_id : userId,
              },
          });

          const productBefore = await prisma.product.findUnique({
              where: {
                  id: cart.product_id,
              },
              select: {
                  stock: true,
                  title: true,
              },
          });




          await prisma.product.update({
              where: {
                  id: cart.product_id,
                  user_id: userId,
              },
              data: {
                  stock: {
                      decrement: cart.qty
                  },
              },
          });

      }

            await prisma.cart.deleteMany({
                where:{
                    cashier_id: cashierId,
                },
            });
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