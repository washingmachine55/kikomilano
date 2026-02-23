// import jwt, { type JwtPayload } from 'jsonwebtoken';
// import { ACCESS_TOKEN_SECRET_KEY } from '../config/env-config.js';

// export function verifyUserToken(req, res) {
// 	const token = req.header('Authorization');

// 	if (!token) return res.status(401).send('Access Denied');

// 	try {
// 		const verified: JwtPayload = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
// 		const userId = verified?.id;
// 		return userId;
// 	} catch (err) {
// 		res.status(400).send('Invalid Token. Please login.' + err);
// 	}
// }
