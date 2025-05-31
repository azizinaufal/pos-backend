import express from 'express';
import {PrismaClient} from '@prisma/client';
import fs from 'fs';
import {parse} from "dotenv";
const prisma = new PrismaClient();

const findProducts = async (req, res) => {

  try {

      const usreId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1)* limit;
      const search = req.query.search || '';

      const products = await prisma.product.findMany({
         where:{
             user_id: usreId,
             title:{
                 contains: search,
             },
         } ,
          select:{
              id:true,
              barcode:true,
              title:true,
              image:true,
              description:true,
              buy_price:true,
              sell_price:true,
              stock:true,
              created_at:true,
              updated_at:true,
              category: {
                  select:{
                      name:true
                  },
              },
          },
          orderBy:{
             id:'desc',
          },
          skip:skip,
          take:limit,
      });

      const totalProducts = await prisma.product.count({
         where:{
             user_id: usreId,
             title:{
                 contains: search,
             },
         } ,
      });

      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).send({
         meta:{
             success:true,
             message:"Berhasil mengambil semua data product"
         },
          data:products,
          pagination:{
              currentPage:page,
              totalPages:totalPages,
              perPage:limit,
              total:totalProducts,
          }
      });
  }  catch(err) {
      res.status(500).send({
         meta:{
             success:false,
             message:"Terjadi kesalahan di server"
         },
          error:err,
      });
  }
};

//CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
      const product = await prisma.product.create({
         data:{
             barcode:req.body.barcode,
             title:req.body.title,
             description:req.body.description,
             buy_price:parseInt(req.body.buy_price),
             sell_price:parseInt(req.body.sell_price),
             stock:parseInt(req.body.stock),
             image:req.file.path,
             category_id:parseInt(req.body.category_id),
             user_id:req.user.id,
         },
          include:{
             category:true,
          }
      });
      res.status(200).send({
          meta:{
              success:true,
              message:'Produk berhasil ditambahkan'
          },
          data:product,
      });
  } catch (err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server"
            },
            error: err.message || String(err),
        })
  }
};

//FIND PRODUCT BY ID
const findProductById = async (req, res) => {
  const {id} = req.params;
  const userId = req.user?.id;
  try {
      const product = await prisma.product.findUnique({
          where:{
              user_id: userId,
              id : Number(id),
          },
          select:{
              id:true,
              barcode:true,
              title:true,
              description:true,
              buy_price:true,
              sell_price:true,
              stock:true,
              image:true,
              category_id:true,
              user_id:true,
              created_at:true,
              updated_at:true,
              category:{
                  select:{
                      name:true,
                      description:true,
                      image:true,
                      created_at:true,
                      updated_at:true,
                  },
              },
          },
      });

      if (!product) {
          res.status(404).send({
              meta:{
                  success:false,
                  message:`Product dengan ID: ${id} tidak ditemukan`
              },
          });
      }

      res.status(200).send({
          meta:{
              success:true,
              message:`Berhasil mengambil produk dengan ID ${id}`
          },
          data:product,
      });
  }catch(err) {
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server"
            },
            error: err.message || String(err),
        })
  }
};

//UPDATE PRODUCT

const updateProduct = async (req, res) => {
  const {id} = req.params;
  const userId = req.user?.id;

  try {
    const dataProduct={
        barcode:req.body.barcode,
        title:req.body.title,
        description:req.body.description,
        buy_price:parseInt(req.body.buy_price),
        sell_price:parseInt(req.body.sell_price),
        stock:parseInt(req.body.stock),
        category_id:parseInt(req.body.category_id),
        updated_at:new Date(),
    };

      if(req.file){
          const product = await prisma.product.findFirst({
              where: {
                  id: Number(id),
                  user_id: userId
              }
          });

          if (!product) {
              return res.status(404).send({
                  meta: {
                      success: false,
                      message: "Produk tidak ditemukan atau bukan milik Anda"
                  }
              });
          }

          if (product.image) {
              fs.unlinkSync(product.image);
          }

          dataProduct.image = req.file.path;
      }

      const product = await prisma.product.update({
        where:{
            id:Number(id),
            user_id:userId
        },
        data:dataProduct,
        include:{
            category:true,
        }
    });

    res.status(200).send({
        meta:{
            success:true,
            message:"Produk berhasil diperbarui"
        },
       data:product,
    });
  }catch(err) {
        res.status(500).send({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server"
           } ,
            error: err.message || String(err),
        });
  }
};

//DELETE PRODUCT

const deleteProduct = async (req, res) => {
  const {id} = req.params;
  const userId = req.user?.id;

  try {
      const product = await prisma.product.findUnique({
          where:{
              id: Number(id),
              user_id: userId
          },
      });

      if (!product) {
          return res.status(404).send({
              meta:{
                  success:false,
                  message:`Produk dengan ID: ${id} tidak ditemukan`
              },
          });
      }
      await prisma.product.delete({
          where:{
              id: Number(id),
              user_id: userId
          },
      });

      if (product.image) {
            const imagePath = product.image;
            const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
            const filePath = `uploads/${fileName}`;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
      }

      res.status(200).send({
          meta:{
              success:true,
              message:"Produk berhasil dihapus"
          },
      });
  }catch (err){
        res.status(500).send({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server"
           },
            error: err.message || String(err),
        });
  }
};

//FIND PRODUCT BY CATEGORY ID

const findproductByCategoryId = async (req,res)=>{
  const {id} = req.params;
  const userId = req.user?.id;


  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const products = await prisma.product.findMany({
         where:{
             category_id:Number(id),
             user_id:userId
         },
          select:{
             id:true,
              barcode:true,
              title:true,
              description:true,
              buy_price:true,
              sell_price:true,
              stock:true,
              image:true,
              category_id:true,
              updated_at:true,
              created_at:true,
          },
          skip:skip,
          take:limit
      });

      const totalProducts = await prisma.product.count({
         where:{
             category_id:Number(id),
             user_id:userId
         },
      });

      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).send({
         meta:{
             success:true,
             message:"Berhasil menampilkan produk berdasarkan kategori"
         },
          data:products,
          pagination:{
              currentPage: page,
              totalPages: totalPages,
              perPage: limit,
              total: totalProducts,
          },
      });
  }catch(err) {
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server"
            },
            error: err.message || String(err),
        });
  }
};

//MENAMPILKAN PRODUK BERDASARKAN BARCODE
const findProductByBarcode = async (req,res)=>{
  const userId = req.user?.id;
  try {
      const products = await prisma.product.findMany({
         where:{
             title:req.body.title,
             user_id:userId
         },
          select:{
              id: true,
              barcode: true,
              title: true,
              description: true,
              buy_price: true,
              sell_price: true,
              stock: true,
              image: true,
              category_id: true,
              created_at: true,
              updated_at: true,
              category:{
                  select:{
                      name: true,
                      description: true,
                      image: true,
                      created_at: true,
                      updated_at: true,
                  },
              },
          },
      });

      if (!products) {
          return res.status(404).send({
              meta:{
                  success:false,
                  message:`Product dengan nama ${req.params.title} tidak ditemukan`,
              },
          });
      }
      res.status(200).send({
         meta:{
             success:true,
             message:"Berhasil mengambil produk berdasarkan nama"
         } ,
          data:products,
      });
  }catch(err) {
        res.status(500).send({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server"
           } ,
            error: err.message || String(err),
        });
  }
};
const productController = {findProducts, createProduct, findProductById, updateProduct,deleteProduct,findproductByCategoryId, findProductByBarcode};
export {productController};