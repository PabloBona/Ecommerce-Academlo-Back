const Cart = require('../models/cart.model');
const Order = require('../models/order.models');
const Product = require('../models/product.model');
const ProductInCart = require('../models/productInCart.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { cart } = req;

  const productInCart = await ProductInCart.create({
    productId,
    quantity,
    cartId: cart.id,
  });

  res.status(201).json({
    status: 'success',
    message: 'The product has been added',
    productInCart,
  });
});

exports.updateCart = catchAsync(async (req, res, next) => {
  const { newQty } = req.body;
  const { productInCart } = req;

  if (newQty < 0) {
    return next(new AppError('The quanity must be grater than 0', 400));
  }

  if (newQty === 0) {
    await productInCart.update({
      quantity: newQty,
      status: 'removed',
    });
  } else {
    await productInCart.update({
      quantity: newQty,
      status: 'active',
    });
  }
  res.status(200).json({
    status: 'success',
    message: 'The product in cart has been updated',
  });
});

exports.removeProductToCart = catchAsync(async (req, res, next) => {
  const { productInCart } = req;

  await productInCart.update({
    quantity: 0,
    status: 'removed',
  });

  res.status(200).json({
    status: 'success',
    message: 'The product in cart has been removed',
  });
});

exports.buyProductOnCart = catchAsync(async (req, res, next) => {
  //1. buscar el carrito del usuario
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    attributes: ['id', 'userId'],
    where: {
      userId: sessionUser.id,
      status: 'active',
    },
    include: [
      {
        model: ProductInCart,
        attributes: { exclude: ['status', 'createAt', 'updateAt'] },
        where: {
          status: 'active',
        },
        include: [
          {
            model: Product,
            attributes: { exclude: ['status', 'createAt', 'updateAt'] },
          },
        ],
      },
    ],
  });

  if (!cart) {
    return next(new AppError('There are not products in cart', 400));
  }
  //2. Calcular el precio total a pagar
  let totalPrice = 0;

  cart.productInCarts.forEach(productInCart => {
    totalPrice += productInCart.quantity * productInCart.product.price;
  });

  //3. Vamos a actualizar el stock o cantidad del modelo Product
  const purcaseProductPromises = cart.productInCarts.map(
    async productInCart => {
      const product = await Product.findOne({
        //buscar el producto para actualzar su info
        where: {
          id: productInCart.productId,
        },
      });
      //calcular la cantidad de productos que me quedan en la tienda
      const newStock = product.quantity - productInCart.quantity;
      //actualizar la info y retornar
      return await product.update({
        quantity: newStock,
      });
    }
  );
  await Promise.all(purcaseProductPromises);

  //crearse una constante que se le van a asignar al map, statusProductInCartPromises

  //recorrer el arreglo de productsInCarts

  const statusProductInCartPromises = cart.productInCarts.map(
    async productInCart => {
      const productInCartFoundIt = await productInCart.findOne({
        where: {
          id: productInCart.id,
          status: 'active',
        },
      });

      return await productInCartFoundIt.update({
        status: 'purchased',
      });
    }
  );

  await Promise.all(statusProductInCartPromises);

  await cart.update({
    status: 'purchased',
  });

  const order = await Order.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
  });

  //buscar el producto en el carrito a actualizar

  //retornar las actualizaciones del producto en el carrito encontrado, y el status:"purchased"

  //fuera del map van a resolver las promesas con el promiseAll

  res.status(201).json({
    message: 'The order has been generated successfully',
    order,
  });
});
