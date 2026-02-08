import jwt from 'jsonwebtoken';
import { env, loadEnvFile } from 'node:process';
import { responseWithStatus } from '../utils/responses.js';
loadEnvFile();

const verifyToken = async (req, res, next) => {
	const verifyTokenFunc = async (req, res, next) => {
		if (!req.header('Authorization')) {
			return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please login.');
		} else {
			const token = req.header('Authorization').split(' ')[1];
			try {
				const verified = jwt.verify(token, env.ACCESS_TOKEN_SECRET_KEY);
				req.user = verified;
				next();
			} catch (err) {
				next(err);
			}
		}
	};

	switch (req.path) {
		case '/auth/register':
			next();
			break;
		case '/auth/login':
			next();
			break;
		case '/auth/forgot-password':
			next();
			break;
		case '/auth/verify-otp':
			next();
			break;
		case '/auth/refresh': // Bypassing this as it requires usage of Refresh token isntead of access token
			next();
			break;
		case '/auth/reset-password': // Bypassing this as it requires usage of Temporary token isntead of access token
			next();
			break;
		default:
			await verifyTokenFunc(req, res, next);
			break;
	}
};

export default verifyToken;
