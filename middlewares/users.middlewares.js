const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.validIfExistUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({
    where: {
      id,
      status: true,
    },
  });
  if (!user) {
    return next(new AppError('User not found ', 404));
  }
  req.user = user;
  next();
});

exports.validIfexistsUserEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (user && !user.status) {
      return res.status(400).json({
        status: 'error',
        message:
          'El usuario tiene una cuenta pero esta desactivada, por favor hable con el administrador',
      });
    }

    if (user) {
      return res.status(400).json({
        status: 'error',
        message: 'The email user already exist',
      });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};
