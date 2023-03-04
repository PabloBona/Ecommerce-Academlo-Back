const Category = require('../models/category.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.validCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findOne({
    where: {
      id,
      status: true,
    },
  });
  if (!category) {
    return next(new AppError('category not found', 404));
  }
  req.category = category;
  next();
});
