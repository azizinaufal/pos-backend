import {body} from "express-validator";

export const validatorSupplier = [
   body("name").notEmpty(). withMessage("Nama tidak boleh kosong"),
    body("no_telp").notEmpty().withMessage("Nomor telepoon tidak boleh kosong"),
    body("address").notEmpty().withMessage("Alamat tidak boleh kosong"),
] ;