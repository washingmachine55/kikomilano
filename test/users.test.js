import pactum from 'pactum';
import * as pm from 'pactum-matchers';
import fs from "node:fs";

process.loadEnvFile();
pactum.request.setBaseUrl(process.env.APP_URL);
pactum.request.setDefaultHeaders({ 'Content-Type': 'application/json' });

describe('Users APIs', () => {
	let accessToken;

	// Setup: Login to get access token
	before(async () => {
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
			.stores('userAccessToken', 'data.access_token');
	});

	describe('GET /users', () => {
		it('should retrieve all users successfully with valid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.expectJsonLike({
					message: 'Details of all available users',
				});
		});

		it('should fail to retrieve users without authentication token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users')
				.expectStatus(401);
		});

		it('should fail to retrieve users with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		it('should return users data in correct format', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.expectJsonMatch({
					type: 1,
					status: 200,
				});
		});
	});

	describe('GET /users/profile', () => {
		it('should retrieve logged-in user profile successfully with valid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/profile')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.expectJsonLike({
					message: 'User profile details',
				});
		});

		it('should fail to retrieve profile without authentication token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/profile')
				.expectStatus(401);
		});

		it('should fail to retrieve profile with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/profile')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		it('should return user profile data in correct format', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/profile')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.expectJsonMatch({
					type: 1,
					status: 200,
					data: {
						user_details: {},
					},
				});
		});

		it('should return user details with id and email', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/profile')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.expectJsonMatch({
					data: {
						user_details: {
							id: pm.like('s'),
							email: pm.like('s'),
						},
					},
				});
		});
	});

	describe('POST /users/profile-picture-upload', () => {
		it('should fail to upload profile picture without authentication token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile-picture-upload')
				.expectStatus(401);
		});

		it('should fail to upload profile picture without file', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile-picture-upload')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(400)
				.expectJsonLike({
					message: 'No image uploaded. Please upload an image before trying again.',
				});
		});

		it('should reject upload with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile-picture-upload')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		xit('should return error when field name is incorrect', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile-picture-upload')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				// .withMultiPartFormData({
				// 	wrongFieldName: 'test.jpg',
				// })
				.withMultiPartFormData('file', fs.readFileSync('testFile.png'), { filename: 'testFile.png' })
				.expectStatus(415)
				.expectJsonLike({
					message: 'Form field does not satisfy requirement. Please enter the correct field name for uploading the file.',
				});
		});
	});

	describe('GET /users - Edge Cases', () => {
		it('should handle multiple requests to get all users', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200);

			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200);
		});

		it('should consistently return same user data', async () => {
			const firstCall = await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200);

			const secondCall = await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200);

			if (!firstCall.body.data.users_details.length) {
				throw new Error('users_details not found in first call');
			}
			if (!secondCall.body.data.users_details.length) {
				throw new Error('users_details not found in second call');
			}
		});
	});
});
