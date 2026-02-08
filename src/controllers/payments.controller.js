import { attempt } from '../utils/errors.js';
import { TextModification } from '../utils/modifyText.js';
import { responseWithStatus } from '../utils/responses.js';
import Stripe from 'stripe';

export const createPayment = await attempt(async (req, res, next) => {
	// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

	// const customer = await stripe.customers.create({
	// 	email: 'ahmed.devminds@gmail.com',
	// });

	// console.log(customer.id);
	// const modifiedObjs = await new TextModification(req.body.data).fullySanitizeObjectKey()

	// console.log(modifiedObjs);

	return await responseWithStatus(res, 1, 200, 'works');
});
