const express = require('express');
const router = express.Router();

const User = require('../controllers/userController');
const Auth = require('../middleware/auth');

router.route('/register').post(User.registerUser);
router.route('/login').post(User.loginUser);
router.route('/logout').get(User.logoutUser);
router.route('/password/forgot').post(User.forgotPassword);
router.route('/password/reset/:token').put(User.resetPassword);
router.route('/me').get(Auth.isAuthenticatedUser, User.getUserDetails);
router.route('/password/update').put(Auth.isAuthenticatedUser, User.updatePassword);
router.route('/me/update').put(Auth.isAuthenticatedUser, User.updateProfile);

router
  .route('/admin/users')
  .get(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), User.getAllUsers);
router
  .route('/admin/user/:id')
  .get(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), User.getSingleUser)
  .put(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), User.updateUserRole)
  .delete(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), User.deleteUser);

// export
module.exports = router;
