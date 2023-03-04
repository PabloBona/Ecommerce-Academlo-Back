const express = require('express');
const { productRouter } = require('../routes/product.routes');
const cors = require('cors');
const { usersRouter } = require('../routes/users.routes');
const { db } = require('../database/db');
const morgan = require('morgan');
const { categoriesRouter } = require('../routes/categories.routes');
const glabalErrorHandler = require('../controllers/error.controller');
const AppError = require('../utils/appError');
const { authRouter } = require('../routes/auth.routes');
const initModel = require('./initModel');
const { cartRouter } = require('../routes/cart.routes');
const { default: xss } = require('xss');
const helmet = require('helmet');
var hpp = require('hpp');
const { rateLimit } = require('express-rate-limit');

//1. Creamos una Clase

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.limiter = rateLimit({
      max: 100,
      windowMs: 60 * 60 * 1000,
      message: 'Too many request from this IP, please try again in an hour',
    });

    this.paths = {
      products: '/api/v1/products',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      auth: '/api/v1/auth',
      cart: '/api/v1/cart',
    };

    // Invocamos la base de datos
    this.database();

    // Invocamos el metodo middlewares
    this.middlewares();

    // Invocamos el metodo routes
    this.routes();
  }

  // Todo lo que diga "use", basicamente es un middlewares
  middlewares() {
    this.app.use(helmet());

    this.app.use(hpp());
    if (process.env.NODE_ENV === 'development') {
      console.log('Hola, estoy en desarrollo');
      this.app.use(morgan('dev'));
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('Hola, estoy en produccion');
    }

    this.app.use('/api/v1', this.limiter);
    // Utilizamos las cors para permitir el acceso a la api
    this.app.use(cors());

    // Utilizamos express.json para parsear el body de la request
    this.app.use(express.json());
  }

  // Rutas
  routes() {
    // Utilizar las rutas del producto
    this.app.use(this.paths.products, productRouter);
    // Utilizar las rutas del user
    this.app.use(this.paths.users, usersRouter);
    // Utilizar las rutas del category
    this.app.use(this.paths.categories, categoriesRouter);
    // Utilizar las rutas del auth
    this.app.use(this.paths.auth, authRouter);
    // Utilizar las rutas del cart
    this.app.use(this.paths.cart, cartRouter);

    this.app.all('*', (req, res, next) => {
      return next(
        new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
      );
    });

    this.app.use(glabalErrorHandler);
  }

  // Metodo para escuchar solicitudes por el puerto
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is Running on Port: ${this.port}`);
    });
  }

  database() {
    db.authenticate()
      .then(() => {
        console.log('Database authenticated');
      })
      .catch(err => console.log(err));

    // Relations
    initModel();

    db.sync() // {force:true} cuando se hace un cambio en los models
      .then(() => {
        console.log('Database sycend');
      })
      .catch(err => console.log(err));
  }
}

//2. Exportamos el servidor
module.exports = Server;
