import jwt from 'jsonwebtoken';
import env from 'node:process';
const JWT_SECRET_KEY = env.JWT_SECRET_KEY

export function verifyUserToken(req, res) {
	const token = req.header('Authorization');

	if (!token) return res.status(401).send('Access Denied');

	try {
		const verified = jwt.verify(token, JWT_SECRET_KEY);
		const userId = verified.id;
		return userId;
	} catch (err) {
		res.status(400).send('Invalid Token. Please login.' + err);
	}
}

