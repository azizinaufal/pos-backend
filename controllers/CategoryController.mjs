import express from 'express';
import fs from 'fs';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();


//GET ALL CATEGORY
const findCategories = async (req,res)=>{
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      const search = req.query.search || '';

      const userId = req.user?.id;

      if(!userId){
          return res.status(401).send({
            meta:{
                success:false,
                message:"Tidak dapat menemukan id pengguna. Akses ditolak"
            },
          });
      }

      const categories = await prisma.category.findMany({
          where: {
              user_id: userId,
              name: {
                  contains: search,
              },
          },
          select: {
              id: true,
              name: true,
              image: true,
              description:true,
              created_at: true,
              updated_at: true,
          },
          orderBy:{
              id:'desc'
          },
          skip:skip,
          take:limit,
      });

      const totalCategories = await prisma.category.count({
          where: {
              user_id: userId,
              name: {
                  contains: search,
              }
          }

      });

      const totalPages = Math.ceil(totalCategories/limit);

      res.status(200).send({
          meta:{
              success:true,
              message: 'Berhasil mendapatkan semua kategori',
          },
          data:categories,
          pagination: {
              currentPage: page,
              totalPages:totalPages,
              perPage: limit,
              total:totalCategories,
          }
      });
  }catch(err){
        res.status(500).send({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server"
           },
            error:err,
        });
  }
};

//CEATE CATEGORY
const createCategory = async (req,res)=>{
  try {
      const category = await prisma.category.create({
         data:{
             name:req.body.name,
             description:req.body.description,
             image:req.file.path,
             user_id: req.user.id,
         },
      });

      res.status(201).send({
         meta:{
             success:true,
             message:"Kategori berhasil dibuat"
         },
          data:category,
      });
  }  catch(err){
      console.error("ERROR CREATE CATEGORY:", err);
        res.status(500).send({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server"
           } ,
            error:err,
        });
  }
};


//FIND CATEGORY BY ID

const findCategoryById = async (req,res)=>{
  const {id} = req.params;
  const userId = req.user?.id;
  try {
      const category = await prisma.category.findUnique({
          where: {
              id:Number(id),
              user_id:userId,
          },
          select:{
              id: true,
              name: true,
              image: true,
              description: true,
              created_at: true,
              updated_at: true,
          },
      });
      if(!category){
          return res.status(404).send({
              meta:{
                  success:false,
                  message:`Kategori dengan ID: ${id} tidak ditemukan`
              },
          });
      }
      res.status(200).send({
          meta:{
              success:true,
              message:`Berhasil mendapatkan kategori dengan ID : ${id}`
          },
          data:category,
      });
  }catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server"
            },
            error:err,
        });
  }
};

//UPDATE CATEGORY
const updateCategory = async (req,res)=>{
  const {id} = req.params;
  const userId = req.user?.id;

  try {

      const existingCategory = await prisma.category.findFirst({
          where: {
              id:Number(id),
              user_id:userId,
          }
      });

      if(!existingCategory){
          return res.status(404).send({
              meta: {
                  success: false,
                  message: `Kategori dengan ID: ${id} tidak ditemukan atau bukan milik Anda`,
              },
          });
      }
      const dataCategory = {
          name: req.body.name,
          description: req.body.description,
          updated_at: new Date(),
      };

      if (req.file) {
          // Hapus file lama jika ada
          if (existingCategory.image) {
              fs.unlinkSync(existingCategory.image);
          }
          dataCategory.image = req.file.path;
      }

      const updatedCategory = await prisma.category.update({
          where: { id: Number(id) },
          data: dataCategory,
      });

      res.status(200).send({
          meta:{
              success:true,
              message:"Kategori berhasil diperbarui"
          },
          data:dataCategory,
      });
  }catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server"
            },
            error:err,
        });
  }
};

//DELETE CATEGORY
const deleteCategory = async (req,res)=>{
  const {id} = req.params;
  const userId= req.user?.id;
  try {
      const category = await prisma.category.findFirst({
         where:{
             id:Number(id),
             user_id:userId
         },
      });

      if(!category){
          return res.status(404).send({
              meta:{
                  success:false,
                  message:`Kategori dengan ID: ${id} tidak ditemukan`
              },
          });
      }
      await prisma.category.delete({
          where:{
              id:Number(id),
          },
      });

      if(category.image){
          const imagePath = category.image;
          const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
          const filePath = `uploads/${fileName}`;
          if (fs.existsSync(filePath)){
              fs.unlinkSync(filePath);
          }
      }

      res.status(200).send({
          meta:{
              success:true,
              message:"Kategori berhasil dihapus"
          },
      });
  }catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server"
            },
            error:err,
        })
  }
};

//GET ALL CATEGORY

const getAllCategories = async (req,res)=>{
    const userId = req.user?.id;
    try {
        const categories = await prisma.category.findMany({
            where:{
                user_id:userId
            },
            select:{
                id:true,
                name: true,
                image: true,
                description: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });

        res.status(200).send({
            meta:{
                success:true,
                message:"Berhasil mendapatkan semua kategori",
            },
            data:categories,
        })
    }  catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server"
            },
            error:err,
        });
    }
};
const categoryController = {findCategories, createCategory, findCategoryById,updateCategory, deleteCategory, getAllCategories};
export {categoryController};