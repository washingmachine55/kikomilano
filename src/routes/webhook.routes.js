import Stripe from 'stripe';
import express from 'express';
import { env, loadEnvFile } from 'node:process';
import { handlePaymentIntentSucceeded, handlePaymentMethodAttached } from '../controllers/payments.controller.js';
loadEnvFile();

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const endpointSecret = env.STRIPE_WEBHOOK_SIGNING_SECRET;

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), (request, response) => {
	let event = request.body;
	if (endpointSecret) {
		const signature = request.headers['stripe-signature'];
		try {
			event = stripe.webhooks.constructEvent(
				request.body,
				signature,
				endpointSecret
			);
		} catch (err) {
			console.log(`⚠️  Webhook signature verification failed.`, err.message);
			return response.sendStatus(400);
		}
	}

	switch (event.type) {
		case 'payment_intent.succeeded':
			const paymentIntent = event.data.object;
			console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
			// Then define and call a method to handle the successful payment intent.
			// handlePaymentIntentSucceeded(paymentIntent);
			handlePaymentIntentSucceeded(paymentIntent);
			break;
		case 'payment_method.attached':
			const paymentMethod = event.data.object;
			// Then define and call a method to handle the successful attachment of a PaymentMethod.
			// handlePaymentMethodAttached(paymentMethod);
			handlePaymentMethodAttached(paymentMethod);
			break;
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}

	// Return a 200 response to acknowledge receipt of the event
	response.send();
});

export default router;