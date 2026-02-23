// import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';
const { JsonWebTokenError } = jwt;

/**
 *
 * @param {Object} payload - Information to save in the JWT that might be reused, such as User ID, email, etc
 * @param {String} secret - Secret key, such as the ones used for access, refresh and temporary tokens from the ENV
 * @param {Object} options - Additional options that can be set for JWT, such as expiration time and algorithm to use
 * @returns - Generated Token using the secret key
 */
export function signJwtAsync(payload: JwtPayload, secret: string, options: SignOptions) {
	return new Promise((resolve, reject) => {
		jwt.sign(payload, secret, options, (err, token) => {
			if (err) {
				reject(err);
				throw new JsonWebTokenError('Unable to sign JWTl', err);
			} else {
				resolve(token);
			}
		});
	});
}

/**
 *
 * @param {String} token - Token retrieved from the request, could be an access, refresh or a temporary token
 * @param {String} secret - Secret key, such as the ones used for access, refresh and temporary tokens from the ENV
 * @returns - Decoded payload from the JWT using the secret key
 */
export function verifyJwtAsync(token: string, secret: Secret) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secret, (err, payload) => {
			if (err) {
				reject(err);
				throw new JsonWebTokenError('Unable to verify JWT', err);
			} else {
				resolve(payload);
			}
		});
	});
}
