import {validateLogin,validateUpdateUser} from './auth.mjs';
import {validateUser} from './user.mjs';
import {validateCategory} from "./category.mjs";
import {validateProduct} from "./product.mjs";
import {validateCustomer} from "./customer.mjs";
import {validateCart} from "./cart.mjs";
import {validateTransaction} from "./transaction.mjs";
import {validateSales} from "./sale.mjs";
import {validatorProfit} from "./profit.mjs";
import {validateRegister} from "./register.mjs";
import {validatorSupplier} from "./supplier.mjs";
import {validateDebit} from "./debit.mjs";

export  {
    validateLogin,
    validateUser,
    validateProduct,
    validateCategory,
    validateCustomer,
    validateCart,
    validatorProfit,
    validateTransaction,
    validateSales,
    validateUpdateUser,
    validateRegister,
    validatorSupplier,
    validateDebit
};