import {validateLogin} from './auth.mjs';
import {validateUser} from './user.mjs';
import {validateCategory} from "./category.mjs";
import {validateProduct} from "./product.mjs";
import {validateCustomer} from "./customer.mjs";
import {validateCart} from "./cart.mjs";
import {validateTransaction} from "./transaction.mjs";
import {validatorSales} from "./sale.mjs";
import {validatorProfit} from "./profit.mjs";

export  {
    validateLogin,
    validateUser,
    validateProduct,
    validateCategory,
    validateCustomer,
    validateCart,
    validatorProfit,
    validateTransaction,
    validatorSales
};