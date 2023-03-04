const Category = require('../models/category.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

exports.findCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({
    attributes: ['id', 'name'],
    where: {
      status: true,
    },
    include: [
      {
        model: Product,
        attributes: { exclude: ['createAt', 'updateAt', 'status'] },
        where: {
          status: true,
        },
      },
    ],
  });

  return res.status(200).json({
    status: 'success',
    message: 'The categories found were Successfully',
    categories,
  });
});

exports.findCategory = catchAsync(async (req, res, next) => {
  const { category } = req;

  return res.status(200).json({
    status: 'success',
    message: 'The category was found Successfully',
    category,
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name: name.toLoweCase(),
  });
  return res.status(201).json({
    status: 'success',
    message: 'The category was created Successfully',
    newCategory,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  //1. OBTENGO MI ID DE LA REQ.PARAMS
  const { category } = req;

  const { name } = req.body;

  //5. SI TODO SALIO BIEN, ACTUALIZAMOS EL PRODUCTO ENCONTRADO
  const updateCategory = await category.update({
    name,
  });
  //6. ENVIO LA RESPUESTA AL CLIENTE
  res.status(200).json({
    status: 'success',
    message: 'The product has been updated',
    updateCategory,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  //1. OBTENGO EL ID DE LA REQ.PARAMS
  const { category } = req;

  //4. ACTUALIZAR EL ESTADO DEL PRODUCTO FALSE
  await category.update({
    status: false,
  });

  res.json({
    status: 'success',
    message: 'The category has been deleted successfully',
  });
});
