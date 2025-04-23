import express from 'express';
import bcrypt from "bcryptjs";
import {PrismaClient} from  '@prisma/client'

const prisma = new PrismaClient();

//Get Data User
const findUser = async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page-1) * limit;

        const search = req.query.search || '';

        const user = await prisma.user.findMany({
            where: {
                name:{
                    contains: search,
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: {
                id: "desc",
            },
            skip: skip,
            take:limit,
        });

        const totalUser = await prisma.user.count({
            where: {
                name:{
                    contains: search,
                }
            },
        });

        const totalPages = Math.ceil(totalUser/limit);

        res.status(200).send({
            meta:{
                success:true,
                message:"Berhasil mengambil semua data pengguna"
            },
            data:user,
            pagination:{
                currentPage:page,
                totalPages:totalPages,
                total:totalPages
            }
        });
    }catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server",
            },
            error:err
        });
    }
};

//Create Data User
const createUser = async (req,res)=>{
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try{
      const user = await prisma.user.create({
         data:{
             name:req.body.name,
             email:req.body.email,
             password:hashedPassword,
         }
      });

      res.status(200).send({
          meta:{
              success:true,
              message:"Berhasil membuat pengguna",
          },
          data:user,
      })
  }catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server",
            },
            error:err
        });
  }
};

//FIND USER BY ID
const findUserById = async (req,res)=>{
    const {id} = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
            select:{
                id: true,
                name: true,
                email: true,
            }
        });
        if(!user){
            res.status(404).send({
                meta:{
                    success:false,
                    message:`Pengguna dengan ID: ${id} tidak ditemukan` ,
                }
            });
        }
        res.status(200).send({
            meta:{
                success:true,
                message:`Berhasil mengambil pengguna dengan ID: ${id}`,
            },
            data:user,
        });
    }catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server",
            },
            error:err
        });
    }
};

//UPDATE USER
const updateUser = async (req,res)=>{
  const {id} = req.params;


  try {
      const { name, email,  password} = req.body;
      const updateData = {
          name,
          email,
          updated_at: new Date()
      };

      if (password && password.trim() !== '') {
          updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await prisma.user.update({
          where: {
              id: Number(id),
          },
          data: updateData,
      });

      if (!user) {
          return res.status(404).send({
              meta: {
                  success: false,
                  message: "Pengguna tidak ditemukan",
              }
          });
      }

      const { password: _removed, ...userWithoutPassword } = user;

      return res.status(200).send({
          meta: {
              success: true,
              message: "Pengguna berhasil diperbarui",
          },
          data: userWithoutPassword,
      });


  }catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server",
            },
            error:err.message || String(err),
        });
  }
};

//DELETE USER
const deleteUser = async (req,res)=>{
  const {id} = req.params;
  try {
      await prisma.user.delete({
          where: {
              id: Number(id),
          }
      });
      res.status(200).send({
          meta:{
              success:true,
              message:"Berhasil menghapus pengguna",
          }
      });
  }catch(err){
        res.status(500).send({
            meta:{
                success:false,
                message:"Terjadi kesalahan di server",
            },
            error:err
        });
  }
};

const UserController = {findUser,createUser, findUserById, updateUser, deleteUser};
export {UserController};