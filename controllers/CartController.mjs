import express from 'express';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const findCarts = async (req,res) =>{
  try {
      const userId = req.user?.id;
      const carts = await prisma.cart.findMany({
         select:{
             id:true,
             cashier_id:true,
             product_id:true,
             qty:true,
             price:true,
             created_at:true,
             updated_at:true,
             product:{
                 select:{
                     id:true,
                     title:true,
                     buy_price:true,
                     sell_price:true,
                     image:true
                 },
             },
             cashier:{
                 select:{
                     id:true,
                     name:true
                 },
             },
         },
          where:{
            cashier_id:userId,
          },
          orderBy:{
             id:'desc',
          },
      });

      const totalPrice= carts.reduce((sum,cart) =>sum + cart.price, 0);

      res.status(200).send({
          meta:{
              success:true,
              message:`Berhasil mendapatkan semua kerangjang oleh kasir: ${userId}`
          },
          data:carts,
          totalPrice:totalPrice,
      });
  }  catch(err){
        res.status(500).send({
           meta:{
               success:false,
               message:'Terjadi kesalahan di server'
           } ,
            error:err.message || String(err)
        });
  }
};

//CREATE CART
 const createCart = async (req,res) =>{
     const userId=  req.user?.id;

   try {
       const product = await prisma.product.findUnique({
          where:{
              id: parseInt(req.body.product_id),
          },
       });

       if(!product){
           return res.status(400).send({
              meta:{
                  success:false,
                  message: `Produk dengan ID: ${req.body.product_id} tidak ditemukan`,
              },
           });
       }
       if (product.user_id !== userId) {
           return res.status(403).send({
               meta: {
                   success: false,
                   message: 'Kamu tidak punya akses ke produk ini',
               },
           });
       }
        const existingCart = await prisma.cart.findFirst({
           where:{
               product_id : parseInt(req.body.product_id),
               cashier_id:userId
           },
        });
       if (existingCart){
           const updateCart = await prisma.cart.update({
              where:{
                  id:existingCart.id,
              } ,
               data:{
                  qty:existingCart.qty + parseInt(req.body.qty),
                   price:product.sell_price * (existingCart.qty + parseInt(req.body.qty)),
                   updated_at: new Date()
               },
               include:{
                  product:true,
                   cashier:{
                      select:{
                          id:true,
                          name:true
                      },
                   },
               },
           });

           res.status(200).send({
              meta:{
                  success:true,
                  message:"Jumlah keranjang diperbarui"
              },
               data:updateCart,
           });
       }else{
           const cart = await prisma.cart.create({
              data:{
                  cashier_id:userId,
                  product_id:parseInt(req.body.product_id),
                  qty:parseInt(req.body.qty),
                  price:product.sell_price * parseInt(req.body.qty),
              },
               include:{
                  product:true,
                   cashier:{
                      select:{
                          id:true,
                          name:true
                      },
                   },
               },
           });
           res.status(200).send({
              meta:{
                  success:true,
                  message:"Keranjang berhasil dibuat"
              },
               data:cart,
           });
       }

   }  catch (err){
        res.status(500).send({
           meta:{
               success:false,
               message:'Terjadi kesalahan di server',
           } ,
            error:err.message || String(err)
        });
   }
 };

 //DELETE CART

const deleteCart = async (req,res)=>{
  const {id} = req.params;
  const userId=  req.user?.id;

  try {
      const cart = await prisma.cart.findUnique({
         where:{
             id:Number(id),
             cashier_id:userId
         },
      });

      if(!cart){
          return res.status(400).send({
             meta:{
                 success:false,
                 message:`Keranjang dengan ID: ${id} tidak ditemukan`,
             } ,
          });
      }

      await prisma.cart.delete({
          where:{
              id:Number(id),
              cashier_id:userId
          },
      });
      res.status(200).send({
         meta:{
             success:true,
             message:`Keranjang berhasil dihapus`
         },
      });
  }catch(err){
        res.status(500).send({
           meta:{
               success:false,
               message:`Terjadi kesalahan di server`,
           } ,
            error:err.message || String(err)
        });
  }
};

const cartController = {findCarts, createCart, deleteCart};
export {cartController};