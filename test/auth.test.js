// import request from 'supertest';
import pactum from 'pactum';
import app from '../src/server.js';

process.loadEnvFile();
pactum.request.setBaseUrl(process.env.APP_URL);
pactum.request.setDefaultHeaders({ 'Content-Type': 'application/json' });

describe('Authentication APIs', () => {
	describe('POST /auth/register', () => {
		it('should register a new user successfully', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/register')
				.withBody(
					`
					{
						"data": {
							"name": "Default Admin",
							"email": "admin@admin.com",
							"password": "Passw*rd1",
							"confirmed_password": "Passw*rd1"
						}
					}
				`
				)
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
							"email": "admin@admin.com",
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

	describe('POST /auth/refresh', () => {
		it('should refresh access token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/login')
				.withBody(
					`
					{
						"data": {
							"email": "admin@admin.com",
							"password": "Passw*rd1"
						}
					}
				`
				)
				.stores('refreshToken', 'data[0].refresh_token');

			await pactum
				.spec()
				.withMethod('POST')
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
							"email": "admin@admin.com",
							"password": "Passw*rd1"
						}
					}
				`
				)
				.stores('accessToken', 'data[0].access_token');

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
							"email": "admin@admin.com",
							"password": "Passw*rd1"
						}
					}
				`
				)
				.stores('refreshToken', 'data[0].refresh_token');

			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/auth/verify-token')
				.withHeaders('Content-Type', 'application/json')
				.withHeaders('Authorization', `Bearer $S{refreshToken}`)
				.expectStatus(401);
		});
	});
});
