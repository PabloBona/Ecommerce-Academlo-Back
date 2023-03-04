const { Router } = require('express');
const { validCategoryById } = require('../middlewares/categories.middlewares');
const {
  findCategory,
  findCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} = require('../controllers/categories.controller');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateField.middlewares');
const {
  protect,
  restrictTo,
  protectAccountOwner,
} = require('../middlewares/auth.middlewares');

const router = Router();

router.get('/:id', validCategoryById, findCategory);

router.get('/', findCategories);

router.use(protect);

router.post(
  '/',
  [
    check('name', 'The name is required').not().isEmpty(),
    validateFields,
    restrictTo('admin'),
  ],
  createCategory
);

router.patch(
  '/:id',
  [
    check('name', 'The name is required').not().isEmpty(),
    validCategoryById,
    validateFields,
    restrictTo('admin'),
  ],
  updateCategory
);

router.delete(
  '/:id',
  validCategoryById,
  restrictTo('admin'),
  // protectAccountOwner,
  deleteCategory
);

module.exports = {
  categoriesRouter: router,
};
