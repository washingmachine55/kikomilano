import pactum from 'pactum';
import * as pm from 'pactum-matchers';
import fs from 'node:fs';
import { randomInt } from 'node:crypto';

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

	describe('GET /users/profile', () => {
		it('should retrieve logged-in user profile successfully with valid token', async function () {
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

		it('should fail to retrieve profile without authentication token', async function () {
			await pactum.spec().withMethod('GET').withPath('/users/profile').expectStatus(401);
		});

		it('should fail to retrieve profile with invalid token', async function () {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/profile')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		it('should return user profile data in correct format', async function () {
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

		it('should return user details with id and email', async function () {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/profile')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.expectStatus(200)
				.expectJsonMatch({
					data: {
						user_details: {
							users_id: pm.like('s'),
							email: pm.like('s'),
						},
					},
				});
		});
	});

	describe('POST /users/profile/edit', () => {
		it('should edit user profile with valid data', async function () {
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

		it('should fail to edit profile without authentication token', async function () {
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

		it('should fail to edit profile with invalid token', async function () {
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

		it('should update user email successfully', async function () {
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

		it('should update user password successfully', async function () {
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

		it('should fail password update with mismatched passwords', async function () {
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

		it('should update multiple user fields at once', async function () {
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

		it('should ignore invalid fields in profile edit request', async function () {
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
					message: 'Validation Error. Please try again.',
				})
				.expectStatus(400);
		});

		it('should handle empty profile edit request', async function () {
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
		it('should fail to upload profile picture without authentication token', async function () {
			await pactum.spec().withMethod('POST').withPath('/users/profile-picture-upload').expectStatus(401);
		});

		it('should fail to upload profile picture without file', async function () {
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

		it('should reject upload with invalid token', async function () {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/profile-picture-upload')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		it('should upload user profile picture successfully with valid file', async function () {
			// Create a minimal valid PNG file for testing (1x1 transparent PNG)
			const minimalPNG = Buffer.from([
				0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00,
				0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00,
				0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
				0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
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

		it('should handle image upload with different file types', async function () {
			// Create a minimal valid JPEG file for testing
			const minimalJPEG = Buffer.from([
				0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00,
				0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07,
				0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12, 0x13, 0x0f, 0x14,
				0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c,
				0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32, 0x3c,
				0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00,
				0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff,
				0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00,
				0x00, 0x01, 0x7d, 0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51,
				0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1,
				0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
				0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a,
				0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73,
				0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93,
				0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2,
				0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca,
				0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8,
				0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01,
				0x01, 0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd0, 0xff, 0xd9,
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

		it('should return error when field name is incorrect', async function () {
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
					message:
						'Form field does not satisfy requirement. Please enter the correct field name for uploading the file.',
				});
		});
	});

	describe('GET /users/favorites', () => {
		before(async function () {
			const randomProductNum = randomInt(0, 25);
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
						products_variants_id: `$S{productId}`,
					},
				})
		});
		it('should retrieve user favorites successfully with valid token', async function () {
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

		it('should fail to retrieve favorites without authentication token', async function () {
			await pactum.spec().withMethod('GET').withPath('/users/favorites').expectStatus(401);
		});

		it('should fail to retrieve favorites with invalid token', async function () {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/users/favorites')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		it('should return favorites data in correct format', async function () {
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
		before(async function () {
			const randomProductNum = randomInt(0, 25);
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
						products_variants_id: `$S{productId}`,
					},
				})
		});
		it('should set favorite successfully with valid token and product id', async function () {
			const randomProductNum = randomInt(0, 25);
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

		it('should fail to set favorite without authentication token', async function () {
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

		it('should fail to set favorite with invalid token', async function () {
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

		it('should fail to set favorite without product id', async function () {
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
		before(async function () {
			const randomProductNum = randomInt(0, 25);
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
						products_variants_id: `$S{productId}`,
					},
				})
		});
		it('should remove favorite successfully with valid token and product id', async function () {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/remove-favorites')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody({
					data: {
						products_variants_array: [
							`$S{productId}`
						]
					}
				})
				.expectStatus(200)
				.expectJsonLike({
					message: 'Product(s) removed from favorites successfully!',
				});
		});

		it('should fail to remove favorite without authentication token', async function () {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/remove-favorites')
				.withBody({
					data: {
						products_variants_array: [
							`$S{productId}`
						],
					},
				})
				.expectStatus(401);
		});

		it('should fail to remove favorite with invalid token', async function () {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/remove-favorites')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.withBody({
					data: {
						products_variants_array: [
							`$S{productId}`
						],
					},
				})
				.expectStatus(401);
		});

		it('should fail to remove favorite without product id', async function () {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/users/remove-favorites')
				.withHeaders('Authorization', `Bearer $S{userAccessToken}`)
				.withBody({
					data: {
						products_variants_array: [],
					},
				})
				.expectStatus(400);
		});
	});
});
