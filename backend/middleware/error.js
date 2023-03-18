const ErrorHandler = require('../utils/errorHandler');

// global error handling middleware
module.exports = (err, req, res, next) => {
  console.log('😥error😥', err);

  err.statuscode = err.statuscode || 500;
  err.message = err.message || 'Internal server errors';

  // wrong monogDB id error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt token error
  if (err.code === 'JsonWebTokenError') {
    const message = 'Json web token is invalid, please try again';
    err = new ErrorHandler(message, 400);
  }

  // jwt expire error
  if (err.code === 'TokenExpiredError') {
    const message = 'Json web token is expired, please try again';
    err = new ErrorHandler(message, 400);
  }

  // console.log('😥error😥', err);
  res.status(err.statuscode).json({ success: false, message: err.message });
};
