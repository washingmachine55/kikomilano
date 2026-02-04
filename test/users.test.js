import pactum from 'pactum';
import * as pm from 'pactum-matchers';
import fs from "node:fs";
import { randomInt } from "node:crypto";

process.loadEnvFile();
pactum.request.setBaseUrl(process.env.APP_URL);
pactum.request.setDefaultHeaders({ 'Content-Type': 'application/json' });

describe('Users APIs', () => {
	let accessToken;

	// Setup: Register to get access token
	before(async () => {
		const randomNum = randomInt(0, 15);
		await pactum
			.spec()
			.withMethod('POST')
			.withPath('/auth/register')
			.withBody(
				`
				{
					"data": {
						"name": "Sample ${randomNum}",
						"email": "admin${randomNum}@admin.com",
						"password": "Passw*rd1",
						"confirmed_password": "Passw*rd1"
					}
				}
			`
			)
			.stores('userAccessToken', 'data.access_token')
			.stores('userId', 'data.user_details.id');
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

	describe('POST /users/profile/edit', () => {
		it('should edit user profile with valid data', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"name": "Updated Admin Name"
						}
					}
				`
				)
				.expectJsonLike({
					message: 'User profile edited successfully',
				})
				.expectStatus(200);
		});

		it('should fail to edit profile without authentication token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withBody(
					`
					{
						"data": {
							"name": "Updated Name"
						}
					}
				`
				)
				.expectStatus(401);
		});

		it('should fail to edit profile with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.withBody(
					`
					{
						"data": {
							"name": "Updated Name"
						}
					}
				`
				)
				.expectStatus(401);
		});

		it('should update user email successfully', async () => {
			const randomNum = randomInt(0, 15);
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"email": "admin${randomNum}@admin.com"
						}
					}
				`
				)
				.expectJsonLike({
					message: 'User profile edited successfully',
				})
				.expectStatus(200);
		});

		it('should update user password successfully', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"password": "NewPassw*rd1",
							"confirmed_password": "NewPassw*rd1"
						}
					}
				`
				)
				.expectJsonLike({
					message: 'User profile edited successfully',
				})
				.expectStatus(200);
		});

		it('should fail password update with mismatched passwords', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"password": "NewPassw*rd1",
							"confirmed_password": "DifferentPassw*rd1"
						}
					}
				`
				)
				.expectStatus(400);
		});

		it('should update multiple user fields at once', async () => {
			const randomNum = randomInt(0, 15);
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"name": "Another Updated Name",
							"email": "admin.new${randomNum}@admin.com"
						}
					}
				`
				)
				.expectJsonLike({
					message: 'User profile edited successfully',
				})
				.expectStatus(200);
		});

		it('should ignore invalid fields in profile edit request', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"name": "Updated Name",
							"invalid_field": "should be ignored",
							"another_invalid": "also ignored"
						}
					}
				`
				)
				.expectJsonLike({
					message: 'User profile edited successfully',
				})
				.expectStatus(200);
		});

		it('should handle empty profile edit request', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile/edit')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody(
					`
					{
						"data": {}
					}
				`
				)
				.expectStatus(200);
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

		it('should upload user profile picture successfully with valid file', async () => {
			// Create a minimal valid PNG file for testing (1x1 transparent PNG)
			const minimalPNG = Buffer.from([
				0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
				0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
				0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
				0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
				0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
				0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
			]);

			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile-picture-upload')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withHeaders('Content-Type', `multipart/form-data`)
				.withMultiPartFormData('userProfilePicture', minimalPNG, { filename: 'profile.png' })
				.expectStatus(200)
				.expectJsonLike({
					message: 'Image uploaded successfully',
				});
		});

		it('should handle image upload with different file types', async () => {
			// Create a minimal valid JPEG file for testing
			const minimalJPEG = Buffer.from([
				0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
				0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
				0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
				0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
				0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
				0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
				0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
				0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
				0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
				0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
				0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
				0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
				0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
				0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
				0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
				0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
				0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
				0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
				0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
				0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
				0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
				0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
				0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
				0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
				0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
				0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
				0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD0, 0xFF, 0xD9
			]);

			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile-picture-upload')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withHeaders('Content-Type', `multipart/form-data`)
				.withMultiPartFormData('userProfilePicture', minimalJPEG, { filename: 'profile.jpg' })
				.expectStatus(200)
				.expectJsonLike({
					message: 'Image uploaded successfully',
				});
		});

		it('should return error when field name is incorrect', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile-picture-upload')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withHeaders('Content-Type', `multipart/form-data`)
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

	describe('GET /users/favorites', () => {
		it('should retrieve user favorites successfully with valid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/favorites')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.expectJsonLike({
					message: "User's favorite products",
				});
		});

		it('should fail to retrieve favorites without authentication token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/favorites')
				.expectStatus(401);
		});

		it('should fail to retrieve favorites with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/favorites')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		it('should return favorites data in correct format', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/favorites')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.expectJsonMatch({
					type: 1,
					status: 200,
				});
		});
	});

	describe('POST /users/set-favorites', () => {
		it('should set favorite successfully with valid token and product id', async () => {
			// FIXSOON
			const randomProductNum = randomInt(0, 15);
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.stores('productId', `data.products_details[${randomProductNum}].product_variant_id`);

			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/set-favorites')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody({
					data: {
						users_id: `$S{userId}`,
						products_variants_id: `$S{productId}`,
					},
				})
				.expectStatus(200)
				.expectJsonLike({
					message: 'Product added to favorites',
				});
		});

		it('should fail to set favorite without authentication token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/set-favorites')
				.withBody({
					data: {
						users_id: `$S{userId}`,
						products_variants_id: `$S{productId}`,
					},
				})
				.expectStatus(401);
		});

		it('should fail to set favorite with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/set-favorites')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.withBody({
					data: {
						users_id: `$S{userId}`,
						products_variants_id: `$S{productId}`,
					},
				})
				.expectStatus(401);
		});

		it('should fail to set favorite without product id', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/set-favorites')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody({
					data: {},
				})
				.expectStatus(400);
		});
	});

	describe('POST /users/remove-favorites', () => {
		it('should remove favorite successfully with valid token and product id', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/remove-favorites')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody({
					data: {
						users_id: `$S{userId}`,
						products_variants_id: `$S{productId}`,
					},
				})
				.expectStatus(200)
				.expectJsonLike({
					message: 'Product removed from favorites',
				});
		});

		it('should fail to remove favorite without authentication token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/remove-favorites')
				.withBody({
					data: {
						users_id: `$S{userId}`,
						products_variants_id: `$S{productId}`,
					},
				})
				.expectStatus(401);
		});

		it('should fail to remove favorite with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/remove-favorites')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.withBody({
					data: {
						users_id: `$S{userId}`,
						products_variants_id: `$S{productId}`,
					},
				})
				.expectStatus(401);
		});

		it('should fail to remove favorite without product id', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/remove-favorites')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody({
					data: {
						users_id: `$S{userId}`,
					},
				})
				.expectStatus(400);
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
