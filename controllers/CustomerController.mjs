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
                message:'Berhasil mengambil data customer',
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

const customerController = {findCustomer};
export {customerController};