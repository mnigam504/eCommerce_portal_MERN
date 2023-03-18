const express = require('express');
const { processPayment, sendStripeApiKey } = require('../controllers/paymentController');
const Auth = require('../middleware/auth');

const router = express.Router();

router.route('/payment/process').post(Auth.isAuthenticatedUser, processPayment);
router.route('/stripeapikey').get(Auth.isAuthenticatedUser, sendStripeApiKey);

module.exports = router;
