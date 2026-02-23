import express from 'express';
const router = express.Router();

import {
	createPayment,
	handlePaymentIntentSucceeded,
	handlePaymentMethodAttached,
} from '@controllers/payments.controller';

router.post('/new', createPayment);
router.post('/confirm', handlePaymentIntentSucceeded);
router.post('/payment-method', handlePaymentMethodAttached);

export default router;
