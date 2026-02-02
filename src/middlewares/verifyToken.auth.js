import jwt from 'jsonwebtoken';
import { env, loadEnvFile } from 'node:process';
import { responseWithStatus } from '../utils/responses.js';
loadEnvFile();

const verifyToken = (req, res, next) => {
	if (!req.header('Authorization')) {
		return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please login.');
	} else {
		const token = req.header('Authorization').split(' ')[1];

		try {
			const verified = jwt.verify(token, env.ACCESS_TOKEN_SECRET_KEY);
			req.user = verified;
			next();
		} catch (err) {
			next(err)
			// return responseWithStatus(res, 0, 401, 'Invalid Token. Please login.', {
			// 	errors: err,
			// });
		}
	}
};

export default verifyToken;
