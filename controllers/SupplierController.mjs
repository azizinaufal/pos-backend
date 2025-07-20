import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();

//GET ALL SUPPLIER (pagination dan search)

const findSuppliers = async (req,res) => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    try {
        const suppliers = await prisma.supplier.findMany({
            where: {
                user_id: userId,
                name: {
                    contains: search,mode:"insensitive"
                }
            },
            orderBy:{ id: "desc"},
            skip:skip,
            take:limit
        });
        const totalSuppliers = await prisma.supplier.count({
            where: {
                user_id: userId,
                name: {contains: search,mode:"insensitive"}
            }
        });

        const totalPages = Math.ceil(totalSuppliers/limit);
        res.status(200).send({
            meta:{
                success: true,
                message:"Berhasil mengambil data pemasok ",
            },
            data:suppliers,
            pagination:{
                currentPage:page,
                totalPages:totalPages,
                perPage:limit,
                total:totalSuppliers,
            },
        });
    }catch (err){
        res.status(500).send({
            meta:{
                success: false,
                message:"Terjadi kesalahan di server ",
            },
            error:err.message,
        });
    }
}


//Create Supplier

const createSupplier = async (req,res) =>{
    const {name,no_telp,address} = req.body;
    try {
        const supplier = await prisma.supplier.create({
           data:{
               name,
               no_telp,
               address,
               user_id:req.user.id,
           },
        });

        res.status(200).send({
            meta:{
                success: true,
                message:"Berhasil menambah data pemasok ",
            },
            data:supplier,
        });
    }catch (err){
        res.status(500).send({
            meta:{
                success: false,
                message:"Terjadi kesalahan di server ",
            },
            error:err.message,
        });
    }
}

//Update Supplier

const updateSupplier = async (req,res) =>{
    const {id} = req.params;
    const userId = req.user?.id;
    try {
        const existingSupplier = await prisma.supplier.findFirst({
            where: {
                id: Number(id),
                user_id: userId
            }
        });

        if (!existingSupplier) {
            return res.status(404).send({
                meta: { success: false, message: "Supplier tidak ditemukan atau bukan milik Anda" }
            });
        }
        const updatedSuppliers = await prisma.supplier.update({
            where: {
                id:Number(id),
            },
            data:{
                name: req.body.name,
                no_telp:req.body.no_telp,
                address:req.body.address,
                updated_at: new Date(),
            }
        });

        res.status(200).send({
            meta:{
                success: true,
                message:"Data Supplier berhasil diubah"
            },
            data:updatedSuppliers,
        });
    }catch (err){
        res.status(500).send({
            meta:{
                success: false,
                message:"Terjadi kesalahan di server ",
            },
            error:err.message,
        })
    }
}

//Delete Supplier
const deleteSupplier = async (req,res) =>{
    const {id} = req.params;
    const userId = req.user?.id;
    try{
        const existingSuppliers = await prisma.supplier.findFirst({
            where: {
                user_id: userId,
                id:Number(id),
            }
        });
        if(!existingSuppliers){
            return res.status(401).send({
                meta:{
                    success:false,
                    message:`Suppliers dengan ID: ${id} tidak ditemukan`,
                },
            });
        }

        await prisma.supplier.delete({
            where: {
                id:Number(id),
            },
        });

        res.status(200).send({
            meta:{
                success: true,
                message:"Data Supplier berhasil dihapus",
            },
        })
    }catch(err){
        res.status(500).send({
            meta:{
                success: false,
                message:"Terjadi kesalahan di server ",
            },
            error:err.message,
        })
    }
}

//GetAll Supplier (buat dropdown)
const allSuppliers = async (req,res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            where: {
                user_id: req.user.id,
            },
            select: {
                id: true,
                name: true,
            },
            orderBy:{ id: "desc"},
        });

        res.status(200).send({
            meta:{
                success: true,
                message:"Berhasil mengambil data ",
            },
            data:suppliers,
        });
    }catch (err){
        res.status(500).send({
            meta:{
                success: false,
                message:"Terjadi kesalahan di server ",
            },
            error:err.message,
        });
    }
}

//Get Supplier By Id
const findSupplierById = async (req,res) =>{
    const {id} = req.params;
    const userId = req.user?.id;
    try{
        const supplier = await prisma.supplier.findFirst({
            where: {
                user_id: userId,
                id:Number(id),
            },
            select: {
                id: true,
                name: true,
                no_telp:true,
                address:true,
                created_at:true,
                updated_at:true,
                user_id:true
            }
        });

        if(!supplier){
            return res.status(401).send({
                meta:{
                    success: false,
                    message:`Data Supplier dengan ID: ${id} tidak ditemukan`,
                }
            });
        }

        res.status(200).send({
            meta:{
                success:true,
                message:`Berhasil mengambil supplier dengan ID:${id}`,
            },
            data:supplier,
        });
    }catch (err){
        res.status(500).send({
            meta:{
                success: false,
                message:"Terjadi kesalahan di server ",
            },
            error:err.message,
        })
    }

}

export const supplierController = {findSuppliers,findSupplierById,createSupplier,updateSupplier,deleteSupplier,allSuppliers};