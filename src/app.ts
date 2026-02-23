import { type Application, type NextFunction, type Request, type Response } from 'express';
import express from 'express';
import cors from 'cors';
import compression from 'compression';

const app: Application = express();

// Running Stripe's webhook before any of the other middlewares and routes, to ensure that no parsing/modification is done of the received data as Stripe requires payload to be provided as a string or a Buffer
import webhookRoutes from '@routes/webhook.routes';
app.use('/webhook', webhookRoutes);

app.set('query parser', 'simple');
app.use(express.json());
app.use(compression());
app.use(
	cors({
		origin: '*',
		credentials: false,
	})
);

// ======================================================================
// ================  All da Routes for da flutes  =======================
// ======================================================================
import staticRoutes from '@routes/static.routes';
app.use('/static', staticRoutes);

import SwaggerUI from 'swagger-ui-express';
app.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(openapiSpecification));

import verifyToken from '@middlewares/verifyToken.auth';
app.use(verifyToken); // Further validation is done inside the middleware to bypass certain routes for token verification

// dis would make sure that all POST requests from the routes below have a validation which is powered by Zod.
import { globallyVerifyInputFields } from '@middlewares/globalInputVerification';
app.use(globallyVerifyInputFields);

import authRoutes from '@routes/auth.routes';
app.use('/auth', authRoutes);

import usersRoutes from '@routes/users.routes';
app.use('/users', usersRoutes);

import productsRoutes from '@routes/products.routes';
app.use('/products', productsRoutes);

import ordersRoutes from '@routes/orders.routes';
app.use('/orders', ordersRoutes);

import paymentsRoutes from '@routes/payments.routes';
app.use('/payments', paymentsRoutes);

// ======================================================================
// ======================  GROBAR ERROR HANDLING  =======================
// ======================================================================

import multer from 'multer';
import { ZodError } from 'zod';
import { responseWithStatus } from './utils/responses';
import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
	UnprocessableContentError,
} from './utils/errors';
import { openapiSpecification } from './config/swagger';

import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
const { JsonWebTokenError } = jwt;

app.use((err: multer.MulterError | Error, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return responseWithStatus(
				res,
				0,
				413,
				`File is too large. Maximum size is ${Number(env['UPLOAD_FILE_MAX_SIZE']) / (1000 * 1000)} MB.`,
				{ error_details: err.message }
			);
		} else if (err.code === 'MISSING_FIELD_NAME') {
			return responseWithStatus(
				res,
				0,
				415,
				'Form field does not satisfy requirement. Please enter the correct field name for uploading the file.',
				{ error_details: err.message }
			);
		} else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
			return responseWithStatus(
				res,
				0,
				415,
				'Form field does not satisfy requirement. Please enter the correct field name for uploading the file.',
				{ error_details: err.message }
			);
		} else {
			return responseWithStatus(res, 0, 500, err.message, { error_type: err.name });
		}
	} else if (err instanceof JsonWebTokenError) {
		return responseWithStatus(res, 0, 401, 'Invalid token. Please login or Register', { error_type: err.message });
	} else if (err instanceof BadRequestError) {
		return responseWithStatus(res, 0, 400, err.message, { error_type: err.name });
	} else if (err instanceof UnauthorizedError) {
		return responseWithStatus(res, 0, 401, err.message, { error_type: err.name });
	} else if (err instanceof ForbiddenError) {
		return responseWithStatus(res, 0, 403, err.message, { error_type: err.name });
	} else if (err instanceof NotFoundError) {
		return responseWithStatus(res, 0, 404, err.message, { error_type: err.name });
	} else if (err instanceof ConflictError) {
		console.debug(err);
		return responseWithStatus(res, 0, 409, err.message, { error_type: err.name, error_cause: err.cause });
	} else if (err instanceof UnprocessableContentError) {
		return responseWithStatus(res, 0, 422, err.message, { error_type: err.name });
	} else if (err instanceof ZodError) {
		return responseWithStatus(res, 0, 400, err.name, { cause: err });
	} else {
		if (err instanceof Stripe.errors.StripeError) {
			switch (err.type) {
				case 'StripeCardError':
					// A declined card error
					return responseWithStatus(res, 0, 500, err.name, err.message);
				case 'StripeRateLimitError':
					// Too many requests made to the API too quickly
					return responseWithStatus(res, 0, 500, err.name, err.message);
				case 'StripeInvalidRequestError':
					// Invalid parameters were supplied to Stripe's API
					return responseWithStatus(res, 0, 500, err.name, err.message);
				case 'StripeAPIError':
					// An error occurred internally with Stripe's API
					return responseWithStatus(res, 0, 500, err.name, err.message);
				case 'StripeConnectionError':
					// Some kind of error occurred during the HTTPS communication
					return responseWithStatus(res, 0, 500, err.name, err.message);
				case 'StripeAuthenticationError':
					// You probably used an incorrect API key
					return responseWithStatus(res, 0, 500, err.name, err.message);
				default:
					// Handle any other types of unexpected errors
					return responseWithStatus(res, 0, 500, err.name, err.message);
			}
		}
	}
});

app.use((_req: Request, res: Response) => {
	return responseWithStatus(res, 0, 404, `Page not found. Use the [/api-docs] endpoint for a guide on all available APIs.`, undefined);
});

export default app;

