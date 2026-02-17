import { getOrderDetails } from '../services/orders/orders.service.js';
import { savePaymentInfo } from '../services/payments/payments.service.js';
import { attempt } from '../utils/errors.js';
import { responseWithStatus } from '../utils/responses.js';
import Stripe from 'stripe';

export const createPayment = await attempt(async (req, res, next) => {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

	const userID = req.user.id;
	const orderID = req.body.data.orders_id;

	const orderDetails = await getOrderDetails(orderID, userID);

	const paymentIntent = await stripe.paymentIntents.create({
		amount: Number(orderDetails.cart_total) * 100,
		currency: 'usd',
		confirm: false,
		use_stripe_sdk: true,
		receipt_email: orderDetails.email,
		automatic_payment_methods: {
			enabled: true,
		},
	});

	const savePayment = await savePaymentInfo(paymentIntent, orderDetails);

	return await responseWithStatus(res, 1, 200, 'works', {
		server_info: savePayment,
		stripe_info: {
			paymentIntent: paymentIntent.client_secret,
			publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
		}
	});
});

export const handlePaymentIntentSucceeded = await attempt(async (paymentIntent) => {
	// WIP
	// some logic that processes the confirmed paymentIntent
	console.log(paymentIntent)
});

export const handlePaymentMethodAttached = await attempt(async (paymentMethod) => {
	// WIP
	// some logic that processes the confirmed paymentMethod
	console.log(paymentMethod)
});
