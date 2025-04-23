import express from 'express';
import {
    validateCategory,
    validateCustomer,
    validateLogin,
    validateProduct,
    validateUser
} from "../utils/validators/index.mjs";
import {handleValidationErrors, upload, verifyToken} from "../middlewares/index.mjs";
import {LoginController} from "../controllers/LoginController.mjs";
import {UserController} from "../controllers/UserController.mjs";
import {categoryController} from "../controllers/CategoryController.mjs";
import {productController} from "../controllers/ProductController.mjs";
import {customerController} from "../controllers/CustomerController.mjs";

const router = express.Router();

const routes = [
    //LOGIN ROUTE
    {method:'post', path:'/login', middlewares:[validateLogin,handleValidationErrors], handler:LoginController.login
    },

    //USER ROUTE
    {method:'get',path:'/users',middlewares:[verifyToken],handler:UserController.findUser},
    {method:'post', path:'/users', middlewares:[verifyToken,validateUser,handleValidationErrors], handler:UserController.createUser},
    {method:'get', path:'/users/:id', middlewares: [verifyToken], handler:UserController.findUserById},
    {method:'put', path:'/users/:id', middlewares: [verifyToken,validateUser,handleValidationErrors], handler:UserController.updateUser},
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

    //CUSTOMER ROUTE
    {method:'get',path:'/customers', middlewares: [verifyToken], handler:customerController.findCustomer},
    {method:'post', path: '/customers', middlewares: [verifyToken,validateCustomer,handleValidationErrors], handler:customerController.createCustomer},
    {method:'get', path: '/customers/:id', middlewares: [verifyToken], handler:customerController.findCustomerById},
    {method:'put', path:'/customers/:id', middlewares: [verifyToken,validateCustomer,handleValidationErrors], handler:customerController.updateCustomer},
    {method:'delete', path: '/customers/:id', middlewares: [verifyToken], handler:customerController.deleteCustomer},
    {method:'get', path:'/customers-all', middlewares: [verifyToken], handler:customerController.allCustomers}
];

//helper
const createRoutes = (routes) => {
    routes.forEach(({ method, path, middlewares, handler }) => {
        router[method](path, ...middlewares, handler);
    });
};


createRoutes(routes);

export{router};