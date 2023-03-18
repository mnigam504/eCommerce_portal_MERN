const express = require('express');
const router = express.Router();

const Product = require('../controllers/productController');
const Auth = require('../middleware/auth');

router.route('/product/:id').get(Product.getProductDetails);

router.route('/products').get(Product.getAllProducts);
router
  .route('/admin/products')
  .get(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), Product.getAdminProducts);
router
  .route('/admin/product/new')
  .post(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), Product.createProduct);
router
  .route('/admin/product/:id')
  .put(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), Product.updateProduct)
  .delete(Auth.isAuthenticatedUser, Auth.authorizeRoles('admin'), Product.deleteProduct);

router.route('/review').put(Auth.isAuthenticatedUser, Product.createReview);
router
  .route('/reviews')
  .get(Product.getProductReview)
  .delete(Auth.isAuthenticatedUser, Product.deleteReview);

// export
module.exports = router;
