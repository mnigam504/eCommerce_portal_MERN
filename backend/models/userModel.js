const mongoose = require('mongoose');
const validator = require('validator');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    maxLength: [30, 'Name cannot exceed 30 characters'],
    minLength: [4, 'Name should have more then 4 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please enter a email'],
    unique: true,
    // using 3rd party validator
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [8, 'Password should be greater than 8 characters'],
    select: false, // by default password field will not be added in a query result
  },
  // object field
  avatar: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  restPasswordExpire: Date,
});

userSchema.pre('save', async function (next) {
  // this keyword points to currently processed document
  if (!this.isModified('password')) return next();

  this.password = await bycrypt.hash(this.password, 10);

  next();
});

// getJWTToken() is an instance method & it will be available on all the doucuments of userSchema
userSchema.methods.getJWTToken = function () {
  // this keyword points to currently processed document

  // payload is current user's id
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// comparePassword() is an instance method & it will be available on all the doucuments of userSchema
userSchema.methods.comparePassword = async function (enteredPassword) {
  // this keyword points to currently processed document
  return bycrypt.compare(enteredPassword, this.password);
};

// an instance method, will be available on all the doucuments of userSchema
userSchema.methods.getResetPasswordToken = function () {
  // this keyword points to currently processed document

  // generate a random token of 20 bytes
  const resetToken = crypto.randomBytes(20).toString('hex');

  // hashing & adding to current user's document in db
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.restPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('users', userSchema);
