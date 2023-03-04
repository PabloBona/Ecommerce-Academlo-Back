const { Router } = require('express');
const { check } = require('express-validator');
const {
  createUser,
  login,
  renewToken,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middlewares');
const { validIfexistsUserEmail } = require('../middlewares/users.middlewares');
const { validateFields } = require('../middlewares/validateField.middlewares');
const { upload } = require('../utils/multer');

const router = Router();

router.use(protect);

router.post(
  '/signup',
  [
    upload.single('profileImgUrl'),
    check('username', 'The name is required').not().isEmpty(),
    check('email', 'The email is required').not().isEmpty(),
    check('email', 'The email is required').isEmail(),
    check('password', 'The password is required').not().isEmpty(),
    validateFields,
    validIfexistsUserEmail,
  ],
  createUser
);

router.post(
  '/login',
  [
    check('email', 'The email is required').not().isEmpty(),
    check('email', 'The email is required').isEmail(),
    check('password', 'The password is required').not().isEmpty(),
    validateFields,
  ],
  login
);

router.get('/renew', renewToken);

module.exports = {
  authRouter: router,
};
