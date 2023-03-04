const { check } = require('express-validator');

exports.createProductValidation = [
  check('title', 'The title is required').not().isEmpty(),
  check('description', 'The description is required').not().isEmpty(),
  check('quantity', 'The quantity is required').not().isEmpty(),
  check('quantity', 'The quantity must be a number').isNumeric(),
  check('price', 'The price is required').not().isEmpty(),
  check('price', 'The price must be a number').isNumeric(),
  check('categoryId', 'The categoryId is required').not().isEmpty(),
  check('categoryId', 'The categoryId must be a number').isNumeric(),
  check('userId', 'The userId is required').not().isEmpty(),
  check('userId', 'The userId must be a number').isNumeric(),
];
