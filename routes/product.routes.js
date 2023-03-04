const { Router } = require('express');
const { check } = require('express-validator');
const {
  findProduct,
  findProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middlewares/auth.middlewares');
const { validProductById } = require('../middlewares/products.middlewares');
const { validateFields } = require('../middlewares/validateField.middlewares');
const {
  createProductValidation,
} = require('../middlewares/validations.middlewares');

const { upload } = require('../utils/multer');
const router = Router();

router.get('/', findProducts);

router.get('/:id', validProductById, findProduct);

router.use(protect);

router.post(
  '/',
  [
    upload.array('productImgs', 3),
    createProductValidation,
    validateFields,
    restrictTo('admin '),
  ],
  createProduct
);

router.patch(
  '/:id',
  [
    check('title', 'The title is required').not().isEmpty(),
    check('description', 'The description is required').not().isEmpty(),
    check('quantity', 'The quantity is required').not().isEmpty(),
    check('quantity', 'The quantity must be a number').isNumeric(),
    check('price', 'The price is required').not().isEmpty(),
    check('price', 'The price must be a number').isNumeric(),
    validateFields,
  ],
  validProductById,
  updateProduct,
  restrictTo('admin')
);

router.delete('/:id', validProductById, deleteProduct);

module.exports = {
  productRouter: router,
};
