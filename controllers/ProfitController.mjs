import express from "express";
import {PrismaClient} from '@prisma/client';
import excelJS from "exceljs";
import {moneyFormat} from "../utils/moneyFormat.mjs";
const prisma = new PrismaClient();

const filterProfit = async (req, res) => {
    const userId = req.user?.id;
  try {
      const startDate = new Date(req.query.start_date);
      const endDate = new Date(req.query.end_date);
      endDate.setHours(23, 59, 59, 999);

      const profits = await prisma.profit.findMany({
         where:{
            user_id: userId,
             created_at: {
                 gte: startDate,
                 lte: endDate,
             },
         },
          include: {
              transaction: {
                  select: {
                      id: true,
                      invoice: true,
                      grand_total: true,
                      created_at: true,
                  },
              },
          },
      });

      const total = await prisma.profit.aggregate({
          _sum: {
              total: true,
          },
          where: {
              user_id:userId,
              created_at: {
                  gte: startDate,
                  lte: endDate,
              },
          },
      });

      res.status(200).send({
          meta:{
              success: true,
              message : `Data profit dari ${req.query.start_date} hingga ${req.query.end_date} berhasil diambil`
          },
          data:{
              profits:profits,
              total:total._sum.total|| 0,
          },
      });

  }  catch(err){
        res.status(500).send({
           meta:{
               success: false,
               message: `Terjadi kesalahan di server`,
           },
            error: err.message || String(err),
        });
  }
};

//EXPORT PROFIT DALAM EXCEL
const exportProfit = async (req, res) => {
  const userId = req.user?.id;

  try {
      const startDate = new Date(req.query.start_date);
      const endDate = new Date(req.query.end_date);
      endDate.setHours(23, 59, 59, 999);

      const profits = await prisma.profit.findMany({
         where:{
             user_id:userId,
             created_at: {
                 gte: startDate,
                 lte: endDate,
             },
         },
          include: {
            transaction: {
                select: {
                    id: true,
                    invoice: true,
                }
            },
          },
      });

      const total = await prisma.profit.aggregate({
         _sum:{
           total: true,
         },
          where:{
              user_id:userId,
              created_at: {
                  gte: startDate,
                  lte: endDate,
              },
          },
      });

      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet('Profits');

      worksheet.columns=[
          {header:"DATE", key:"created_at", width:10},
          {header: "INVOICE", key:"invoice", width:20},
          {header:"TOTAL", key:"total", width:20},
      ];

      worksheet.columns.forEach((col)=>{
          col.style={
             font : {bold:true},
             align: {horizontal:'center'},
             border:{
                 top:{style:"thin"},
                 left:{style:"thin"},
                 bottom:{style:"thin"},
                 right:{style:"thin"},
             },
          };
      });

      profits.forEach((profit)=>{
         worksheet.addRow({
             created_at : profit.created_at,
             invoice : profit.transaction.invoice,
             total:moneyFormat(profit.total)

         });
      });

      const totalRow = worksheet.addRow({
         created_at:'',
         invoice:'TOTAL',
          total:`Rp ${moneyFormat(total._sum.total)}`,
      });

      totalRow.eachCell((cell,colNumber)=>{
            cell.font = {bold:true};
            cell.alignment = {horizontal:true};
            if(colNumber===5){
                cell.alignment = {horizontal:"center"};
            }
            cell.border={
                top:{style:'thin'},
                left:{style:'thin'},
                bottom:{style:'thin'},
                right:{style:'thin'},
          };
      });
      res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('' +
          'Content-Disposition',
          'attachment; filename="laporan-keuntungan.xlsx"'
      );
      workbook.xlsx.write(res);
  }catch(err){
        res.status(500).send({
           meta:{
               success: false,
               message: `Terjadi kesalahan di server`,
           } ,
            error: err.message || String(err),
        });
  }
};

const profitController = {filterProfit,exportProfit};
export {profitController};