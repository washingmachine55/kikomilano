import pactum from 'pactum';
import { randomInt } from "node:crypto";

process.loadEnvFile();
pactum.request.setBaseUrl(process.env.APP_URL);
pactum.request.setDefaultHeaders({ 'Content-Type': 'application/json' });

describe('Authentication APIs', () => {
	describe('POST /auth/register', () => {
		it('should register a new user successfully', async () => {
			const randomNum = randomInt(0, 99);
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/register')
				.withBody(
					`
					{
						"data": {
							"name": "Default Admin",
							"email": "admin${randomNum}@admin.com",
							"password": "Passw*rd1",
							"confirmed_password": "Passw*rd1"
						}
					}
				`
				)
				.stores('registeredEmail1', 'data.user_details.email')
				.expectJsonLike({
					message: 'Sign Up successful!',
				})
				.expectStatus(201);
		});

		it('should fail if required fields are missing', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/register')
				.withBody(
					`
					{
						"data": {
							"name": "Default Admin"
						}
					}
				`
				)
				.expectStatus(400);
		});
	});

	describe('POST /auth/login', () => {
		it('should login a user with valid credentials', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/login')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "Passw*rd1"
						}
					}
				`
				)
				.expectJsonLike({
					message: 'Sign in successful!',
				})
				.expectStatus(200);
		});

		it('should fail with invalid credentials', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/login')
				.withBody(
					`
					{
						"data": {
							"email": "admin@admin.com",
							"password": "Passw*rd1a"
						}
					}
				`
				)
				.expectJsonLike({
					type: 0,
				})
				.expectStatus(401);
		});
	});

	describe('GET /auth/refresh', () => {
		it('should refresh access token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/login')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "Passw*rd1"
						}
					}
				`
			)
				.stores('refreshToken', 'data.refresh_token');

			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/auth/refresh')
				.withHeaders('Authorization', `Bearer $S{refreshToken}`)
				.expectJsonMatch({
					message: 'Tokens refreshed successfully',
				})
				.expectStatus(201);
		});
	});

	describe('GET /auth/verify-token', () => {
		it('should verify a valid bearer token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/login')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "Passw*rd1"
						}
					}
				`
				)
				.stores('accessToken', 'data.access_token');

			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/auth/verify-token')
				.withHeaders('Content-Type', 'application/json')
				.withHeaders('Authorization', `Bearer $S{accessToken}`)
				.expectJsonMatch({
					message: 'Token Verified Successfully',
				});
		});

		it('should reject an invalid token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/login')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "Passw*rd1"
						}
					}
				`
				)
				.stores('refreshToken', 'data.refresh_token');

			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/auth/verify-token')
				.withHeaders('Content-Type', 'application/json')
				.withHeaders('Authorization', `Bearer $S{refreshToken}`)
				.expectStatus(401);
		});
	});

	describe('POST /auth/forgot-password', () => {
		it('should initiate forgot password flow with valid email', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/forgot-password')
				.withBody(`
					{
						"data": {
							"email": "$S{registeredEmail1}"
						}
					}
				`)
				.expectJsonLike({
					message: 'An OTP has been shared to your email address. Please use that to reset your password in the next screen.',
				})
				.expectStatus(200);
		});

		it('should fail forgot password with non-existent email', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/forgot-password')
				.withBody(
					`
					{
						"data": {
							"email": "nonexistent@example.com"
						}
					}
				`
				)
				.expectJsonLike({
					message: "Email doesn't exist. Please sign up instead.",
				})
				.expectStatus(401);
		});

		it('should fail forgot password with missing email field', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/forgot-password')
				.withBody(
					`
					{
						"data": {}
					}
				`
				)
				.expectStatus(400);
		});
	});

	describe('POST /auth/verify-otp', () => {
		it('should verify OTP and return temporary token', async () => {
			// First request OTP
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/forgot-password')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}"
						}
					}
				`
				);

			// OTP would be sent to email, using a known OTP from seeded data
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/verify-otp')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"otp": "112233"
						}
					}
				`
				)
				.expectJsonLike({
					message: 'OTP has been verified!',
				})
				.stores('tempToken', 'data.temporary_token')
				.expectStatus(200);
		});

		it('should fail OTP verification with invalid OTP', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/verify-otp')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"otp": "000000"
						}
					}
				`
				)
				.expectStatus(401);
		});

		it('should fail OTP verification with missing fields', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/verify-otp')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}"
						}
					}
				`
				)
				.expectStatus(400);
		});
	});

	describe('POST /auth/reset-password', () => {
		it('should reset password with valid temporary token', async () => {
			// First get OTP verification to obtain temporary token
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/forgot-password')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}"
						}
					}
				`
				);

			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/verify-otp')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"otp": "112233"
						}
					}
				`
				)
				.stores('tempToken', 'data.temporary_token');

			// Now reset password with temporary token
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/reset-password')
				.withHeaders('Authorization', `Bearer $S{tempToken}`)
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "NewPassw*rd1",
							"confirmed_password": "NewPassw*rd1"
						}
					}
				`
				)
				.expectJsonLike({
					message: 'Password Reset successful!',
				})
				.expectStatus(201);

			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/reset-password')
				.withHeaders('Authorization', `Bearer $S{tempToken}`)
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "Passw*rd1",
							"confirmed_password": "Passw*rd1"
						}
					}
				`
				)
		});

		it('should fail reset password without authorization header', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/reset-password')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "NewPassw*rd1",
							"confirmed_password": "NewPassw*rd1"
						}
					}
				`
				)
				.expectStatus(401)
				.expectJsonLike({
					message: 'Unauthorized. Access Denied. Please request another OTP.',
				});
		});

		it('should fail reset password with mismatched passwords', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/forgot-password')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}"
						}
					}
				`
				);

			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/verify-otp')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"otp": "112233"
						}
					}
				`
				)
				.stores('tempToken', 'data.temporary_token');

			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/reset-password')
				.withHeaders('Authorization', `Bearer $S{tempToken}`)
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "NewPassw*rd1",
							"confirmed_password": "DifferentPassw*rd1"
						}
					}
				`
				)
				.expectStatus(400)
				.expectJsonLike({
					message: 'Validation Error. Please try again.',
				});
		});

		it('should fail reset password with invalid temporary token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/reset-password')
				.withHeaders('Authorization', 'Bearer invalid_temporary_token')
				.withBody(
					`
					{
						"data": {
							"email": "$S{registeredEmail1}",
							"password": "NewPassw*rd1",
							"confirmed_password": "NewPassw*rd1"
						}
					}
				`
				)
				.expectStatus(401);
		});
	});
});
