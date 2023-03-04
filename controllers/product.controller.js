const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const Product = require('../models/product.model');
const ProductImg = require('../models/productImg.model');
const catchAsync = require('../utils/catchAsync');
const { storage } = require('../utils/firebase');

exports.findProducts = catchAsync(async (req, res) => {
  const products = await Product.findAll({
    where: {
      status: true,
    },
    include: [
      {
        model: ProductImg,
      },
    ],
  });

  const productPromises = products.map(async product => {
    const productImgsPromises = product.productImgs.map(async productImg => {
      const imgRef = ref(storage, productImg.imgUrl);
      const url = await getDownloadURL(imgRef);

      productImg.imgUrl = url;

      return productImg;
    });

    await Promise.all(productImgsPromises);
  });

  await Promise.all(productPromises);

  res.status(200).json({
    status: 'success',
    message: 'The products found were Successfully',
    products,
  });
});

exports.findProduct = catchAsync(async (req, res) => {
  const { product } = req;

  const productImgsPromises = product.productImgs.map(async productImg => {
    const imgRef = ref(storage, productImg.imgUrl);
    const url = await getDownloadURL(imgRef);

    productImg.imgUrl = url;

    return productImg;
  });

  await Promise.all(productImgsPromises);

  return res.status(200).json({
    status: 'success',
    message: 'The product was found Successfully',
    product,
  });
});

exports.createProduct = catchAsync(async (req, res) => {
  const { title, description, price, quantity, categoryId, userId } = req.body;

  const newProduct = await Product.create({
    title: title.toLowerCase(),
    description: description.toLowerCase(),
    price,
    quantity,
    categoryId,
    userId,
  });

  const productImgsPromises = req.files.map(async file => {
    const imgRef = ref(
      storage,
      `products/${Date.now()} - ${file.originalname}`
    );

    const imgUploaded = await uploadBytes(imgRef, file.buffer);

    return await ProductImg.create({
      imgUrl: imgUploaded.metadata.fullPath,
      productId: newProduct.id,
    });
  });

  await Promise.all(productImgsPromises);

  res.status(201).json({
    status: 'success',
    message: 'The product was created Successfully',
    newProduct,
  });
});

exports.updateProduct = async (req, res) => {
  //1. OBTENGO MI ID DE LA REQ.PARAMS
  const { product } = req;
  //2. OBTENER LA INFORMACION A ACTUALIZAR EN LA REQ.BODY
  const { title, description, price, quantity } = req.body;

  //5. SI TODO SALIO BIEN, ACTUALIZAMOS EL PRODUCTO ENCONTRADO
  const updateProduct = await product.update({
    title,
    description,
    price,
    quantity,
  });
  //6. ENVIO LA RESPUESTA AL CLIENTE
  res.status(200).json({
    status: 'success',
    message: 'The product has been updated',
    updateProduct,
  });
};

exports.deleteProduct = catchAsync(async (req, res) => {
  const { product } = req;

  //4. ACTUALIZAR EL ESTADO DEL PRODUCTO FALSE
  await product.update({
    status: false,
  });
  // await product.destroy() para eliminar

  //5. ENVIAR RESPUESTA AL CLIENTE
  res.json({
    status: 'success',
    message: 'The product has been deleted successfully',
    id,
  });
});
