import express from "express";
import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();
import fs from 'fs';

//GET DATA CUSOTOMER

const findCustomer = async (req,res) =>{
  const userId = req.user?.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
  try {
        const customers = await prisma.customer.findMany({
           where: {
               user_id: userId,
               name:{
                   contains:search,
               }
           },
            select: {
               id:true,
                name:true,
                no_telp:true,
                address:true,
                created_at:true,
                updated_at:true,
            },
            orderBy:{
               id:"desc",
            },
            skip:skip,
            take:limit,
        });

        const totalCustomers = await prisma.customer.count({
           where:
               {
                   name:{
                       contains:search,
                   },
               },
        });

      const totalPages = Math.ceil(totalCustomers / limit);
        res.status(200).send({
            meta:{
                success:true,
                message:'Berhasil mengambil data pelanggan',
            },
            data:customers,
            pagination:{
                currentPage:page,
                totalPages:totalPages,
                perPage:limit,
                total:totalPages,
            },
        });
  }catch(err){
        res.status(500).send({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server"
           } ,
            error:err.message || String(err),
        });
  }
};

//CREATE CUSTOMER
const createCustomer = async (req,res) =>{
    try {
        const customer = await prisma.customer.create({
           data:{
               name:req.body.name,
               no_telp:req.body.no_telp,
               address:req.body.address,
               user_id:req.user.id,
           }
        });

        res.status(200).send({
           meta:{
               success:true,
               message:'Data customer berhasil dibuat',
           },
            data:customer,
        });
    }catch(err){
        res.status(500).send({
           meta:{
               success:false,
               message:"Terjadi kesalahan di server"
           } ,
            error:err.message || String(err),
        });
    }
};

//FIND CUSTOMER BY ID

const findCustomerById = async (req,res) =>{
  const {id} = req.params;
  const userId = req.user?.id;

  try {
      const customer = await prisma.customer.findUnique({
          where:{
              id:Number(id),
              user_id:userId,
          },
          select: {
              id:true,
              name:true,
              no_telp:true,
              address:true,
              created_at:true,
              updated_at:true,
              user_id:true

          },
      });

      if(!customer){
          res.status(404).send({
             meta:{
                 success:false,
                 message:`Pelanggan dengan ID:${id} tidak ada`
             } ,
          });
      }
      res.status(200).send({
         meta:{
             success:true,
             message:`Berhasil mengambil pelanggan dengan ID:${id}`,
         },
          data:customer,
      });
  }catch(err){
      res.status(500).send({
         meta:{
             success:false,
             message:"Terjadi kesalahan di server"
         },
          error:err.message || String(err),
      });
  }
};

const customerController = {findCustomer,createCustomer,findCustomerById};
export {customerController};