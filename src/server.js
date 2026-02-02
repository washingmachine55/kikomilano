import express from 'express';
import cors from 'cors';
import compression from 'compression';
import multer from 'multer';
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

import SwaggerUI from 'swagger-ui-express';
import swaggerDocument from '../swagger_output.json' with { type: 'json' };
app.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(swaggerDocument));

import authRoutes from './routes/auth.routes.js';
app.use('/auth', authRoutes);

import usersRoutes from './routes/users.routes.js';
app.use('/users', usersRoutes);

import productsRoutes from './routes/products.routes.js';
app.use('/products', productsRoutes);

import ordersRoutes from './routes/orders.routes.js';
app.use('/orders', ordersRoutes);

import { responseWithStatus } from './utils/responses.js';
import jwt from 'jsonwebtoken';
import { NotFoundError, ValidationError } from './utils/errors.js';
import { ZodError } from 'zod';
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
		} else {
			return responseWithStatus(res, 0, 400, err.message);
		}
	} else if (err instanceof JsonWebTokenError) {
		return responseWithStatus(res, 0, 401, "Invalid token. Please login or Register", err.message);
	}
	else if (err instanceof ValidationError) {
		console.debug(err.stack);
		return responseWithStatus(res, 0, 400, err.message, err.name);
	}
	else if (err instanceof ZodError) {
		console.debug(err.stack);
		return responseWithStatus(res, 0, 404, err.name, { cause: err });
	}
	else if (err instanceof NotFoundError) {
		console.debug(err.stack);
		return responseWithStatus(res, 0, 404, err.message, err);
	}
	if (err.code == '23503' || err.code === '23505') {
		return responseWithStatus(res, 1, 409, "An error occured", "Conflict in database records")
	}
	else if (err) {
		return responseWithStatus(res, 0, 500, err.name, err.message);
	}
	next(err);
});

app.use((req, res) => {
	responseWithStatus(res, 0, 404, `Page not found. Use the [/api-docs] endpoint for a guide on all available APIs.`);
});

// ------------------------------------------------------------------------
// App Initialization
export const server = app.listen(env.APP_PORT, () => {
	if (env.NODE_ENV == 'dev') {
		console.log(`${env.APP_NAME} listening on port ${env.APP_PORT}`);
	}
});

server.keepAliveTimeout = Number(env.APP_KEEP_ALIVE_TIMEOUT);
server.headersTimeout = Number(env.APP_HEADERS_TIMEOUT);

export default app;
