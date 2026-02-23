import { getOrderDetails } from '../services/orders/orders.service.js';
import { savePaymentInfo } from '../services/payments/payments.service.js';
import { attempt } from '../utils/errors.js';
import { responseWithStatus } from '../utils/responses.js';
import Stripe from 'stripe';
import type { NextFunction, Response, Request } from 'express';


export const createPayment = attempt(async (req: Request, res: Response, _next: NextFunction) => {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

	const userID: string = req.user!['id'];
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

	await responseWithStatus(res, 1, 200, 'works', {
		server_info: savePayment,
		stripe_info: {
			paymentIntent: paymentIntent.client_secret,
			publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
		},
	});
});

export const handlePaymentIntentSucceeded = attempt(async (paymentIntent) => {
	// WIP
	// some logic that processes the confirmed paymentIntent
	console.log('handlePaymentIntentSucceeded was triggered!');
	console.log(paymentIntent);
});

export const handlePaymentMethodAttached = attempt(async (paymentMethod) => {
	// WIP
	// some logic that processes the confirmed paymentMethod
	console.log(paymentMethod);
});
