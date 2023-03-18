const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
// const dotenv = require('dotenv');
const path = require('path');

// connecting to config file
if (process.env.NODE_ENV !== 'PRODUCTION') {
  require('dotenv').config({ path: './backend/config/config.env' });
}

// route imports
const product = require('./routes/productRoutes');
const user = require('./routes/userRoutes');
const order = require('./routes/orderRoutes');
const payment = require('./routes/paymentRoute');
const errorMiddleware = require('./middleware/error');

const app = express();

// BODY PARSER
app.use(express.json());

// COOKIE PARSER
app.use(cookieParser());

// FOR FILE/IMAGE UPLOAD
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// API routes
app.use('/api/v1', product);
app.use('/api/v1', user);
app.use('/api/v1', order);
app.use('/api/v1', payment);

// global error handling middleware
app.use(errorMiddleware);

// using final react build to render the website
app.use(express.static(path.join(__dirname, '../frontend/build')));
// will send react's final build "index.html" for all the requested routes/url
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
});

// export
module.exports = app;
