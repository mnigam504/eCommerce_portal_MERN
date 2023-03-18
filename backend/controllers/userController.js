const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

// register a user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  // for image upload to cloudinary
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: 'avatars',
    width: 150,
    crop: 'scale',
  });

  const user = await User.create({
    name,
    email,
    password,
    avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
  });

  sendToken(user, 201, res);
});

// login user
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user have give password & email both
  if (!email || !password) return next(new ErrorHandler('Please enter email & password', 401));

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new ErrorHandler('Invalid email or password'));

  // comparePassword() an instance method of userSchema, will be available on all the user documemts
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) return next(new ErrorHandler('Invalid email or password', 401));

  sendToken(user, 200, res);
});

// logout user
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true });

  res.status(200).json({ success: true, message: 'Logged out' });
});

// forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new ErrorHandler('User not found', 404));

  // get resetpassword token
  const resetToken = user.getResetPasswordToken();

  // saving current user document to upate value of resetToken & expire time
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${resetToken}`;

  // used duing react development
  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your password reset token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce password recovery`,
      message,
    });

    res.status(200).json({ success: true, message: `Email send to ${user.email} successfully` });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.restPasswordExpire = undefined;

    // saving current user document to upate value of resetToken & expire time
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(err.message, 500));
  }
});

// reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const token = req.params.token;
  // console.log(token);

  // creating token hash
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ resetPasswordToken, restPasswordExpire: { $gt: Date.now() } });

  if (!user) {
    return next(new ErrorHandler('Reset password token is invalid or has been expired', 404));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 404));
  }

  // password updation & resetPasswordToken, restPasswordExpire will be removed from current user's document in db
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.restPasswordExpire = undefined;

  // saving current user document to upate values
  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, res);
});

// get currently logged-in user's details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, user });
});

// upadate currently logged-in user's password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) return next(new ErrorHandler('Old passwrod is incorrect', 400));

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 404));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// upadate currently logged-in user's profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  // for image update
  if (req.body.avatar !== '') {
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;

    // delete existing image on cloudinary
    await cloudinary.v2.uploader.destroy(imageId);

    // to upload new image to cloudinary
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });

    // adding avatar field to newUserData object
    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, user });
});

// get all users details -- admin
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ success: true, users });
});

// get single user deatils -- admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`));

  res.status(200).json({ success: true, user });
});

// update a user profile -- admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, message: 'User updated successfully' });
});

// delete a user -- admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`, 400));

  // delete existing image on cloudinary
  const imageId = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});
