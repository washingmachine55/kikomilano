import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { env, loadEnvFile } from 'node:process';

loadEnvFile();
const app = express();

app.set('query parser', 'simple');
app.use(express.json());
app.use(compression());
app.use(express.static('../public'));
app.use(
	cors({
		origin: '*',
		credentials: false,
	})
);

// ======================================================================
// ================  All da Routes for da flutes  =======================
// ======================================================================
import SwaggerUI from 'swagger-ui-express';
app.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(openapiSpecification));

import verifyToken from './middlewares/verifyToken.auth.js';
app.use(verifyToken); // Further validation is done inside the middleware to bypass certain routes for token verification

// dis would make sure that all POST requests from the routes below have a validation which is powered by Zod.
import { globallyVerifyInputFields } from './middlewares/globalInputVerification.js';
app.use(globallyVerifyInputFields);

import authRoutes from './routes/auth.routes.js';
app.use('/auth', authRoutes);

import usersRoutes from './routes/users.routes.js';
app.use('/users', usersRoutes);

import productsRoutes from './routes/products.routes.js';
app.use('/products', productsRoutes);

import ordersRoutes from './routes/orders.routes.js';
app.use('/orders', ordersRoutes);

import paymentsRoutes from './routes/payments.routes.js';
app.use('/payments', paymentsRoutes);

// ======================================================================
// ======================  GROBAR ERROR HANDLING  =======================
// ======================================================================

import multer from 'multer';
import { ZodError } from 'zod';
import { responseWithStatus } from './utils/responses.js';
import { BadRequestError, NotFoundError, ValidationError } from './utils/errors.js';
import { openapiSpecification } from './config/swagger.js';

import jwt from 'jsonwebtoken';
const { JsonWebTokenError } = jwt;

app.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return responseWithStatus(
				res,
				0,
				413,
				`File is too large. Maximum size is ${Number(env.UPLOAD_FILE_MAX_SIZE) / (1000 * 1000)} MB.`,
				err.message
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
			return responseWithStatus(res, 0, 400, err.message);
		}
	} else if (err instanceof JsonWebTokenError) {
		return responseWithStatus(res, 0, 401, 'Invalid token. Please login or Register', err.message);
	} else if (err instanceof ValidationError) {
		console.debug(err.stack);
		return responseWithStatus(res, 0, 400, err.message, err.name);
	} else if (err instanceof BadRequestError) {
		console.debug(err.stack);
		return responseWithStatus(res, 0, 400, err.name, err.message);
	} else if (err instanceof ZodError) {
		console.debug(err.stack);
		return responseWithStatus(res, 0, 400, err.name, { cause: err });
	} else if (err instanceof NotFoundError) {
		console.debug(err.stack);
		return responseWithStatus(res, 0, 404, err.message, err);
	}
	if (err.code == '23503' || err.code === '23505') {
		return responseWithStatus(res, 1, 409, 'An error occurred', 'Conflict in database records');
	} else if (err) {
		console.log(err);
		switch (err.type) {
			case 'StripeCardError':
				// A declined card error
				responseWithStatus(res, 0, 500, err.name, err.message);
				break;
			case 'StripeRateLimitError':
				// Too many requests made to the API too quickly
				responseWithStatus(res, 0, 500, err.name, err.message);
				break;
			case 'StripeInvalidRequestError':
				// Invalid parameters were supplied to Stripe's API
				responseWithStatus(res, 0, 500, err.name, err.message);
				break;
			case 'StripeAPIError':
				// An error occurred internally with Stripe's API
				responseWithStatus(res, 0, 500, err.name, err.message);
				break;
			case 'StripeConnectionError':
				// Some kind of error occurred during the HTTPS communication
				responseWithStatus(res, 0, 500, err.name, err.message);
				break;
			case 'StripeAuthenticationError':
				// You probably used an incorrect API key
				responseWithStatus(res, 0, 500, err.name, err.message);
				break;
			default:
				// Handle any other types of unexpected errors
				responseWithStatus(res, 0, 500, err.name, err.message);
				break;
		}
	}
	next(err);
});

app.use((req, res) => {
	responseWithStatus(res, 0, 404, `Page not found. Use the [/api-docs] endpoint for a guide on all available APIs.`);
});

// ======================================================================
// ======================  App Initialization  ==========================
// ======================================================================
export const server = app.listen(env.APP_PORT, () => {
	if (env.NODE_ENV == 'dev') {
		console.log(`${env.APP_NAME} listening on port ${env.APP_PORT}`);
	}
});

server.keepAliveTimeout = Number(env.APP_KEEP_ALIVE_TIMEOUT);
server.headersTimeout = Number(env.APP_HEADERS_TIMEOUT);

export default app;
