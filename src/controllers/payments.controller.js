import { RecordCheck } from '../providers/recordChecks.providers.js';
import { getOrderDetails } from '../services/orders/orders.service.js';
import { savePaymentInfo } from '../services/payments/payments.service.js';
import { attempt } from '../utils/errors.js';
import { TextModification } from '../utils/modifyText.js';
import { responseWithStatus } from '../utils/responses.js';
import Stripe from 'stripe';

export const createPayment = await attempt(async (req, res, next) => {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

	const userID = req.user.id;
	const orderID = req.body.data.orders_id;

	const orderDetails = await getOrderDetails(orderID, userID);

	// const paymentIntent = await stripe.paymentIntents.create({
	// 	amount: Number(orderDetails.cart_total) * 100,
	// 	currency: 'usd',
	// 	confirm: false,
	// 	use_stripe_sdk: true,
	// 	receipt_email: orderDetails.email,
	// 	automatic_payment_methods: {
	// 		enabled: true,
	// 	},
	// });

	const savePayment = await savePaymentInfo(paymentIntent, orderDetails);

	return await responseWithStatus(res, 1, 200, 'works', savePayment);
});

export const confirmPayment = await attempt(async (req, res, next) => {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

	const userID = req.user.id;
	const orderID = req.body.data.orders_id;

	const orderDetails = await getOrderDetails(orderID, userID);

	// const paymentIntentId = await paymentIntentId(userID);

	const paymentIntent = await stripe.paymentIntents.confirm({
		amount: orderDetails.cart_total,
		currency: 'usd',
		use_stripe_sdk: true,
		automatic_payment_methods: {
			enabled: true,
		},
	});

	return await responseWithStatus(res, 1, 200, 'works', paymentIntent);
});
