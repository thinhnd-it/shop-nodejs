const path = require('path');
const isAuth = require('../middlewares/is_auth')
const { check } = require('express-validator')

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  '/add-product', 
  [
    check('title').isString().isLength({min: 3}).trim(),
    check('price').isNumeric(),
    check('description').isString().isLength({min: 3, max: 400})
  ],
  isAuth, adminController.postAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product', 
  [
    check('title').isString().isLength({min: 3}).trim(),
    check('price').isNumeric(),
    check('description').isString().isLength({min: 3, max: 400})
  ],
  isAuth, adminController.postEditProduct);

router.delete('/products/:id', isAuth, adminController.deleteProduct);

module.exports = router;
