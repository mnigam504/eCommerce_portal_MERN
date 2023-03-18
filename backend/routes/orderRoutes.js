const express = require('express');
const router = express.Router();

const Order = require('../controllers/orderController');
const Auth = require('../middleware/auth');

router.route('/order/new').post(Auth.isAuthenticatedUser, Order.newOrder);
router.route('/order/me').get(Auth.isAuthenticatedUser, Order.myOrder);
router.route('/order/:id').get(Auth.isAuthenticatedUser, Order.getSingleOrder);
router
  .route('/admin/order')
  .get(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), Order.getAllOrders);
router
  .route('/admin/order/:id')
  .put(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), Order.updateOrder)
  .delete(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), Order.deleteOrder);

module.exports = router;
