import {PrismaClient} from "@prisma/client";
import {randomInvoice} from "../utils/generateRandomInvoice.mjs";
const prisma = new PrismaClient();

const createDebit = async (req,res) => {
    const userId = req.user?.id;
    const {supplier_id,grand_total, items} = req.body;

    try{
        const debit = await prisma.$transaction(async (tx)=>{
           const newDebit = await tx.debit.create({
               data:{
                   user_id: userId,
                   supplier_id: parseInt(supplier_id),
                   invoice:randomInvoice('DEBIT'),
                   grand_total:parseFloat(grand_total),
               }
           });

           for(const item of items){


               const product = await tx.product.findUnique({
                   where: {
                       id: parseInt(item.product_id)
                   }
               });

               if (!product) {
                   throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);
               }

               const buyPrice = parseFloat(item.price);
               const sellPrice = product.sell_price;

               if (sellPrice > 0 && buyPrice > sellPrice) {
                   throw new Error(`Harga beli (Rp ${buyPrice}) untuk produk '${product.title}' tidak boleh lebih tinggi dari harga jualnya (Rp ${sellPrice}).`);
               }
               await tx.debitDetail.create({
                  data:{
                      debit_id:newDebit.id,
                      product_id:parseInt(item.product_id),
                      qty:parseInt(item.qty),
                      price:buyPrice,
                  }
               });
               await tx.product.update({
                   where:{
                       id:parseInt(item.product_id),
                   },
                   data:{
                       stock:{
                           increment:parseInt(item.qty),
                       },
                       buy_price:buyPrice,
                   }
               });
           }
           return newDebit;
        });

        res.status(200).send({
           meta:{
               success:"true",
               message:"Transaksi Debit berhasil dan stok diperbarui"
           },
            data:debit,
        });
    }catch(err){
        res.status(500).send({
            meta:{
                success:"false",
                message:"Terjadi kesalahan di server",
            },
            error:err.message || "Terjadi kesalahan di transaksi debit"
        });
    }
};

//GET ALL DEBIT
const getDebitAll = async (req,res) => {
    const userId= req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1)* limit;
    const search = req.query.search || '';

    try {
        const debits = await prisma.debit.findMany({
            where:{
                user_id: userId,
                supplier:{
                    name: {contains: search,mode:"insensitive"}
                }
            },
            include:{
                supplier:{
                    select:{
                        name:true
                    }
                },
                debit_details:{
                    include:{
                        product:{
                            select:{
                                title:true
                            }
                        }
                    }
                },
            },
            orderBy:{ id: "desc"},
            skip:skip,
            take:limit
        });
        const totalDebits = await prisma.debit.count({
            where: {
                user_id: userId,
                supplier:{
                    name: {contains: search,mode:"insensitive"}
                }
            },
        });

        const totalPages = Math.ceil(totalDebits/limit);
        res.status(200).send({
            meta:{
                success: true,
                message:"Berhasil mengambil data debit ",
            },
            data:debits,
            pagination:{
                currentPage:page,
                totalPages:totalPages,
                perPage:limit,
                total:totalDebits,
            },
        });
    }catch(err){
        res.status(500).send({
            meta:{
                success:"false",
                message:"Terjadi kesalahan di server",
            },
            error:err.message || String(err),
        })
    }
}

// Find Debits

const findDebits = async (req,res) => {
    const userId = req.user?.id;
    const {start_date, end_date} = req.query;

    if(!start_date || !end_date){
        return res.status(400).send({
            meta:{
                success:"false",
                message:"Parameter start_date dan edn_date harus diisi"
            }
        });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23,59,59,999);

    try{
        const debits = await prisma.debit.findMany({
            where:{
                user_id: userId,
                created_at:{
                    gte:startDate,
                    lte:endDate,
                }
            }, include: {
                supplier:{
                    select:{
                        name:true
                    },
                },
                debit_details:{
                    include:{
                        product:{
                            select:{
                                title:true
                            }
                        }
                    }
                }
            },
            orderBy:{
                created_at:"desc",
            }
        });

        res.status(200).send({
            meta:{
                success:"true",
                message:"Riwayat debit berhasil diambil"
            },
            data:debits,
        });
    }catch(err){
        res.status(500).send({
            meta:{
                success:"false",
                message:"Terjadi kesalahan di server",
            },
            error:err.message
        });
    }
};

export const debitController = {createDebit, findDebits,getDebitAll};