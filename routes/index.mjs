import express from 'express';
import {
    validateCart,
    validateCategory,
    validateCustomer,
    validateLogin,
    validateProduct, validateTransaction,
    validateUser, validateSales, validatorProfit, validateUpdateUser, validateRegister,validatorSupplier, validateDebit
} from "../utils/validators/index.mjs";
import {handleValidationErrors, upload, verifyToken} from "../middlewares/index.mjs";
import {LoginController} from "../controllers/LoginController.mjs";
import {UserController} from "../controllers/UserController.mjs";
import {categoryController} from "../controllers/CategoryController.mjs";
import {productController} from "../controllers/ProductController.mjs";
import {customerController} from "../controllers/CustomerController.mjs";
import {cartController} from "../controllers/CartController.mjs";
import {transactionController} from "../controllers/TransactionController.mjs";
import {salesController} from "../controllers/SalesController.mjs";
import {profitController} from "../controllers/ProfitController.mjs";
import {dashboardController} from "../controllers/DashboardController.mjs";
import {registerController} from "../controllers/RegisterController.mjs";
import {supplierController} from "../controllers/SupplierController.mjs";
import {debitController} from "../controllers/DebitController.mjs";


const router = express.Router();

const routes = [
    //REGISTER ROUTE

    {method:'post', path:'/register', middlewares: [validateRegister,handleValidationErrors],handler:registerController.registerUser},

    //LOGIN ROUTE
    {method:'post', path:'/login', middlewares:[validateLogin,handleValidationErrors], handler:LoginController.login},

    //USER ROUTE
    {method:'get',path:'/users',middlewares:[verifyToken],handler:UserController.findUser},
    {method:'post', path:'/users', middlewares:[verifyToken,validateUser,handleValidationErrors], handler:UserController.createUser},
    {method:'get', path:'/users/:id', middlewares: [verifyToken], handler:UserController.findUserById},
    {method:'put', path:'/users/:id', middlewares: [verifyToken,validateUpdateUser,handleValidationErrors], handler:UserController.updateUser},
    {method:'delete', path:'/users/:id', middlewares: [verifyToken], handler:UserController.deleteUser},

    //CATEGORY ROUTE
    {method:'get', path:'/categories', middlewares:[verifyToken], handler:categoryController.findCategories},
    {method: 'post', path:'/categories', middlewares: [verifyToken,upload.single('image'),validateCategory, handleValidationErrors], handler:categoryController.createCategory},
    {method:'get', path:'/categories/:id', middlewares: [verifyToken], handler:categoryController.findCategoryById},
    {method: 'put', path: '/categories/:id',middlewares: [verifyToken,upload.single('image'),validateCategory, handleValidationErrors], handler:categoryController.updateCategory},
    {method: 'delete', path: '/categories/:id', middlewares: [verifyToken], handler:categoryController.deleteCategory},
    {method: 'get', path: '/categories-all', middlewares: [verifyToken], handler:categoryController.getAllCategories},

    //PRODUCT ROUTE
    {method:'get', path:'/products', middlewares: [verifyToken],handler:productController.findProducts},
    {method: 'post', path: '/products', middlewares: [verifyToken,upload.single('image'),validateProduct,handleValidationErrors], handler:productController.createProduct},
    {method: 'get',path: '/products/:id', middlewares: [verifyToken], handler:productController.findProductById},
    {method: 'put',path: '/products/:id', middlewares: [verifyToken,upload.single('image'),validateProduct,handleValidationErrors], handler:productController.updateProduct},
    {method:'delete', path: '/products/:id', middlewares: [verifyToken], handler:productController.deleteProduct},
    {method:'get', path: '/products-by-category/:id', middlewares: [verifyToken], handler:productController.findproductByCategoryId},
    {method: 'post', path: '/products-by-barcode', middlewares: [verifyToken], handler:productController.findProductByBarcode},
    {method: 'get', path: '/products-all', middlewares: [verifyToken], handler:productController.getAllProducts},

    //CUSTOMER ROUTE
    {method:'get',path:'/customers', middlewares: [verifyToken], handler:customerController.findCustomer},
    {method:'post', path: '/customers', middlewares: [verifyToken,validateCustomer,handleValidationErrors], handler:customerController.createCustomer},
    {method:'get', path: '/customers/:id', middlewares: [verifyToken], handler:customerController.findCustomerById},
    {method:'put', path:'/customers/:id', middlewares: [verifyToken,validateCustomer,handleValidationErrors], handler:customerController.updateCustomer},
    {method:'delete', path: '/customers/:id', middlewares: [verifyToken], handler:customerController.deleteCustomer},
    {method:'get', path:'/customers-all', middlewares: [verifyToken], handler:customerController.allCustomers},

    //SUPPLIER ROUTE
    {method: 'get', path:'/suppliers', middlewares: [verifyToken], handler:supplierController.findSuppliers},
    {method: 'post', path:'/suppliers', middlewares: [verifyToken,validatorSupplier,handleValidationErrors], handler:supplierController.createSupplier},
    {method:'get', path: '/suppliers/:id', middlewares: [verifyToken], handler:supplierController.findSupplierById},
    {method: 'put', path:'/suppliers/:id', middlewares: [verifyToken,validatorSupplier,handleValidationErrors], handler:supplierController.updateSupplier},
    {method: 'delete', path:'/suppliers/:id', middlewares: [verifyToken], handler:supplierController.deleteSupplier},
    {method: 'get', path:'/suppliers-all', middlewares: [verifyToken], handler:supplierController.allSuppliers},


    //CART ROUTE
    {method:'get',path:'/carts', middlewares: [verifyToken], handler:cartController.findCarts},
    {method:'post', path:'/carts', middlewares: [verifyToken,validateCart,handleValidationErrors], handler:cartController.createCart},
    {method: 'delete', path: '/carts/:id', middlewares: [verifyToken], handler:cartController.deleteCart},


    //TRANSACTION ROUTE
    {method:'post', path:'/transactions', middlewares: [verifyToken,validateTransaction,handleValidationErrors], handler:transactionController.createTransaction},
    {method:'get', path:'/transactions', middlewares: [verifyToken], handler:transactionController.findTransactionByInvoice},

    //SALES ROUTE
    {method: 'get', path: '/sales', middlewares: [verifyToken,validateSales, handleValidationErrors], handler:salesController.filterSales},
    {method: 'get', path: '/sales/export', middlewares: [verifyToken,validateSales,handleValidationErrors], handler:salesController.exportSales},

    //PROFIT ROUTE
    {method:'get', path: '/profits', middlewares: [verifyToken,validatorProfit,handleValidationErrors], handler:profitController.filterProfit},
    {method:'get', path:'/profits/export', middlewares: [verifyToken,validatorProfit,handleValidationErrors], handler:profitController.exportProfit},

    //DEBIT ROUTE
    {method: 'post', path:'/debits', middlewares: [verifyToken,validateDebit,handleValidationErrors],handler:debitController.createDebit },
    {method: 'get', path:'/debits', middlewares: [verifyToken],handler:debitController.findDebits },
    {method: 'get', path:'/debits-all', middlewares: [verifyToken],handler:debitController.getDebitAll },

    //DASHBOARD ROUTE
    {method:'get', path:'/dashboard', middlewares: [verifyToken], handler:dashboardController.getDashboardData},
];

//helper
const createRoutes = (routes) => {
    routes.forEach(({ method, path, middlewares, handler }) => {
        router[method](path, ...middlewares, handler);
    });
};


createRoutes(routes);

export{router};