const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');

// create a new product -- ADMIN
exports.createProduct = catchAsyncError(async (req, res, next) => {
  let images = [];
  if (typeof req.body.images === 'string') {
    // only one image
    images.push(req.body.images);
  } else {
    // more than one images
    images = req.body.images;
  }

  const imagesLink = [];
  for (let i = 0; i < images.length; i++) {
    // uploading images to cloudinary
    const result = await cloudinary.v2.uploader.upload(images[i], { folder: 'products' });

    imagesLink.push({ public_id: result.public_id, url: result.secure_url });
  }

  // adding new filed "images" to req.body object
  req.body.images = imagesLink;

  // adding current logged-in user's id to user field of req.body object
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({ success: true, product });
});

// get all products
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 8;

  const productsCount = await Product.countDocuments();

  const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter();

  let products = await apiFeatures.query.clone();
  let filteredProductsCount = products.length;

  apiFeatures.pagination(resultPerPage);
  products = await apiFeatures.query;

  res
    .status(200)
    .json({ success: true, productsCount, products, resultPerPage, filteredProductsCount });
});

// get all products - ADMIN
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({ success: true, products });
});

// get single proudct details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 500));
  }

  res.status(200).json({ success: true, product });
});

// update a product -- ADMIN
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 500));
  }

  let images = [];
  if (typeof req.body.images === 'string') {
    // only one image
    images.push(req.body.images);
  } else {
    // more than one images
    images = req.body.images;
  }

  if (images !== undefined) {
    // deleting images from cloudinary
    for (i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLink = [];
    for (let i = 0; i < images.length; i++) {
      // uploading images to cloudinary
      const result = await cloudinary.v2.uploader.upload(images[i], { folder: 'products' });

      imagesLink.push({ public_id: result.public_id, url: result.secure_url });
    }

    // // adding new filed "images" to req.body object
    req.body.images = imagesLink;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the modified document
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, product });
});

// delete a product -- ADMIN
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 500));
  }

  // deleting images from cloudinary
  for (i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  await Product.deleteOne({ _id: req.params.id });

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

// create new review or update an existing review
exports.createReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      // upating existing review
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    // creating new review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((review) => {
    avg += review.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

// get all reviews of a product
exports.getProductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) return next(new ErrorHandler('Product not found', 404));

  res.status(200).json({ success: true, reviews: product.reviews });
});

// detele a review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) return next(new ErrorHandler('Product not found', 404));

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.reviewId.toString()
  );

  let avg = 0;
  reviews.forEach((review) => {
    avg += review.rating;
  });

  let ratings = 0;
  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, numOfReviews, ratings },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.status(200).json({ success: true });
});
