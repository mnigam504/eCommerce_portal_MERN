const mongoose = require('mongoose');

const porductSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please enter product name'], trim: true },
  description: { type: String, required: [true, 'Please enter product description'] },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    maxLength: [8, 'Price cannot exceed 8 characters'],
  },
  ratings: { type: Number, default: 0 },
  // array of objects
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  category: { type: String, required: [true, 'Please enter product category'] },
  stock: {
    type: Number,
    require: [true, 'Please enter product stock'],
    maxLength: [4, 'Stock cannot exceed 4 characters'],
    default: 1,
  },
  numOfReviews: { type: Number, default: 0 },
  // array of objects
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users', // parent referencing
        required: true,
      },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users', // parent referencing
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('products', porductSchema);
