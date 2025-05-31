import express from 'express';
import {PrismaClient} from '@prisma/client';
import excelJS from 'exceljs';
import {moneyFormat} from "../utils/moneyFormat.mjs";

const prisma = new PrismaClient();

const filterSales = async (req,res,next) => {
  const userId = req.user?.id;

  try {
      if (!req.query.start_date || !req.query.end_date) {
          return res.status(400).send({
              meta: {
                  success: false,
                  message: 'Parameter start_date dan end_date wajib diisi.',
              },
          });
      }

      const startDate = new Date(req.query.start_date);
      const endDate = new Date(req.query.end_date);
      endDate.setHours(23, 59, 59, 999);
      if (isNaN(startDate) || isNaN(endDate)) {
          return res.status(400).send({
              meta: {
                  success: false,
                  message: 'Format tanggal tidak valid.',
              },
          });
      }

      const sales =  await prisma.transaction.findMany({
          where:{
              cashier_id:userId,
              created_at:{
                  gte:startDate,
                  lte:endDate,
              },
          },
          include:{
              cashier:{
                  select:{
                      id:true,
                      name:true,
                  },
              },
              customer:{
                  select:{
                      id:true,
                      name:true,
                  },
              },
          },

      });

      const total = await prisma.transaction.aggregate({
         _sum:{
             grand_total:true,
         },
          where:{
             cashier_id:userId,
              created_at:{
                 gte:startDate,
                  lte:endDate,
              },
          },
      });
      res.status(200).json({
         meta:{
             success:true,
             message: `Data penjualan dari ${req.query.start_date} hingga ${req.query.end_date} berhasil diambil`

         },
          data:{
             sales:sales,
              total:total._sum.grand_total || 0,
          },
      });
  }catch(err){
        res.status(500).send({
           meta:{
               success:false,
               message:'Terjadi kesalahan di server'
           } ,
            error:err.message || String(err),
        });
  }
};

//EXPORT
const exportSales = async (req,res,next) => {
  const userId = req.user?.id;

  try {
      const startDate = new Date(req.query.start_date);
      const endDate = new Date(req.query.end_date);
      endDate.setHours(23, 59, 59, 999);

      const sales = await prisma.transaction.findMany({
         where:{
             cashier_id:userId,
             created_at:{
                 gte:startDate,
                 lte:endDate,
             },
         },
          include:{
             cashier:{
                 select:{
                     id:true,
                     name:true,
                 },
             },
              customer:{
                 select:{
                     id:true,
                     name:true,
                 },
              },
          },
      });

      const total = await prisma.transaction.aggregate({
            _sum:{
                grand_total:true,
            },
          where:{
                cashier_id:userId,
                created_at:{
                    gte:startDate,
                    lte:endDate,
                },
          },
      });

      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet('Penjualan');

      worksheet.columns=[
          {header:'DATE', key:'created_at', width:'25'},
          {header:'INVOICE', key:'invoice', width:'30'},
          {header:'CASHIER', key:'cashier', width:'15'},
          {header:'CUSTOMER', key:'customer', width:'15'},
          {header:'TOTAL', key:'grand_total', width:'15'},
      ];

      worksheet.columns.forEach(column => {
         column.style = {
             font: {bold:true},
             align: {horizontal:'center'},
             border:{
                top:{style:'thin'},
                left:{style:'thin'},
                right:{style:'thin'},
                bottom:{style:'thin'},
             },
         };
      });

      sales.forEach(sale => {
         worksheet.addRow({
             created_at:sale.created_at,
             invoice:sale.invoice,
             cashier:sale.cashier.name,
             customer:sale.customer?.name || 'Umum',
             grand_total:`Rp ${moneyFormat(sale.grand_total)}`,
         });
      });

      const totalRow = worksheet.addRow({
          created_at:'',
          invoice:'',
          cashier:'',
          customer:'TOTAL',
          grand_total:`Rp ${moneyFormat(total._sum.grand_total)}`,
      });

      totalRow.eachCell((cell, colNumber)=>{
         cell.font = {bold:true};
         cell.alignment = {horizontal:'right'};
         if(colNumber===5){
            cell.alignment= {horizontal:'center'};
         }
         cell.border = {
             top:{style:'thin'},
             left:{style:'thin'},
             right:{style:'thin'},
             bottom:{style:'thin'},
         };
      });

      res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="laporan-penjualan.xlsx"');
      workbook.xlsx.write(res);

  }catch(err){
        res.status(500).send({
           meta:{
               success:false,
               message:'Terjadi kesalahan di server'
           } ,
            error:err.message || String(err),
        });
  }
};

const salesController = {filterSales,exportSales};
export  {salesController};