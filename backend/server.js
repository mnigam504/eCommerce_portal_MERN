const app = require('./app');
// const dotenv = require('dotenv');
const cloudinary = require('cloudinary');
const connectDatabase = require('./database');

// to handle UNCAUGHT EXCEPTIONS (synchronous code error)
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('UNCAUGHT EXCEPTIONS. Shutting down...');

  // shutting down the application
  process.exit(1);
});

// connecting to config file
if (process.env.NODE_ENV !== 'PRODUCTION') {
  require('dotenv').config({ path: './backend/config/config.env' });
}

// connect to database
connectDatabase();

// to upload file/image
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});

// to handle UNHANDLED PROMISE REJECTIONS (asynchronous code errors)
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('UNHANDLED REJECTIONS. Shutting down gracefully');

  // closing the server but before that still handle all of the pending requests
  server.close(() => {
    // shutting down the application
    process.exit(1);
  });
});
