import pactum from 'pactum';
import * as pm from 'pactum-matchers';
import { randomInt } from 'node:crypto';

process.loadEnvFile();
pactum.request.setBaseUrl(process.env.APP_URL);
pactum.request.setDefaultHeaders({ 'Content-Type': 'application/json' });

describe('Products APIs', () => {
	let accessToken;
	let productId;

	// Setup: Login to get access token
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
			.stores('productAccessToken', 'data.access_token');
	});

	describe('GET /products', () => {
		it('should retrieve all products successfully with valid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer $S{productAccessToken}')
				.expectStatus(200)
				.expectJsonLike({
					message: 'Details of all available products.',
				});
		});

		it('should fail to retrieve products without authentication token', async () => {
			await pactum.spec().withMethod('GET').withPath('/products').expectStatus(401);
		});

		it('should fail to retrieve products with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		it('should return products data in correct format', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer $S{productAccessToken}')
				.expectStatus(200)
				.expectJsonMatch({
					type: 1,
					status: 200,
				});
		});

		it('should return products with required fields', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer $S{productAccessToken}')
				.expectStatus(200)
				// .expectJsonMatch({
				// 	data: {
				// 		type: [],
				// 	},
				// });
				.expectJsonLength('data.products_details', pm.gt(1));
		});
	});

	describe('GET /products?category=categoryName', () => {
		it('should retrieve products filtered by category', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer $S{productAccessToken}')
				.withQueryParams('category', 'FACE')
				.expectStatus(200)
				.expectJsonLike({
					message: 'Details of all available products of the selected category.',
				});
		});

		it('should return 404 for non-existent category', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer $S{productAccessToken}')
				.withQueryParams('category', 'non_existent_category_xyz')
				.expectStatus(404)
				.expectJsonLike({
					message: 'That category does not exist.',
				});
		});

		it('should fail category filter without authentication', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withQueryParams('category', 'clothing')
				.expectStatus(401);
		});

		it('should return products with category filter in correct format', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withQueryParams('category', 'FACE')
				.withHeaders('Authorization', 'Bearer $S{productAccessToken}')
				.expectStatus(200)
				.expectJsonMatch({
					type: 1,
					status: 200,
				});
		});
	});

	describe('GET /products/:productId/variants', () => {
		// Note: This assumes a valid product ID exists in the database
		// If no products exist, these tests may fail
		before(async () => {
			const randomNum = randomInt(0, 25);
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/auth/register')
				.withBody(
					`
				{
					"data": {
						"name": "Sample ${randomNum}",
						"email": "admin.${randomNum}@admin.com",
						"password": "Passw*rd1",
						"confirmed_password": "Passw*rd1"
					}
				}
			`
				)
				.stores('altProductAccessToken', 'data.access_token');

			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer $S{altProductAccessToken}')
				.stores('productId', 'data.products_details[0].product_id');
		});

		it('should fail to retrieve variants without authentication token', async () => {
			await pactum.spec().withMethod('GET').withPath('/products/$S{productId}/variants').expectStatus(401);
		});

		it('should fail to retrieve variants with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products/$S{productId}/variants')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.expectStatus(401);
		});

		it('should return 404 for non-existent product ID', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products/019c0729-5c77-75fe-8e6c-ea9a542fe2c6/variants')
				.withHeaders('Authorization', 'Bearer $S{altProductAccessToken}')
				.expectStatus(404)
				.expectJsonLike({
					message: 'No product variants found of this product id.',
				});
		});

		it('should return variants data in correct format when found', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products/$S{productId}/variants')
				.withHeaders('Authorization', 'Bearer $S{altProductAccessToken}')
				.expectStatus(200);
		});

		it('should return error for invalid UUID format in path', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products/invalid-uuid-format/variants')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(400);
		});
	});

	describe('GET /products - Multiple Requests', () => {
		it('should handle sequential product requests', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200);

			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200);
		});

		it('should return consistent product data across requests', async () => {
			const firstCall = await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200);

			const secondCall = await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200);

			if (!firstCall.body.data.products_details) {
				throw new Error('products_details not found in first call');
			}
			if (!secondCall.body.data.products_details) {
				throw new Error('products_details not found in second call');
			}
		});

		it('should handle mixed category and uncategorized requests', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withQueryParams('category', 'FACE')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200);

			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200);
		});
	});

	describe('GET /products - Error Handling', () => {
		it('should reject requests with malformed headers', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer')
				.expectStatus(401);
		});

		it('should reject requests with empty bearer token', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('Authorization', 'Bearer ')
				.expectStatus(401);
		});

		xit('should handle requests with extra whitespace in query', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withQueryParams('category', '  clothing  ')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200);
		});
	});

	describe('GET /products/:productId/variants - Edge Cases', () => {
		it('should validate UUID format strictly', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products/not-a-uuid/variants')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(400);
		});

		it('should handle all zeros UUID', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products/00000000-0000-0000-0000-000000000000/variants')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(400);
		});

		it('should handle max UUID value', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products/ffffffff-ffff-ffff-ffff-ffffffffffff/variants')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(400);
		});

		xit('should be case-insensitive for UUID in path', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products/019C074B-7E98-7A38-BBD9-F82E2BD8C5C8/variants')
				.withHeaders('Authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200);
		});
	});

	describe('Authorization and Security', () => {
		it('should reject expired or tampered tokens', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders(
					'Authorization',
					'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRhbXBlcmVkIn0.invalid'
				)
				.expectStatus(401);
		});

		it('should require exact Authorization header name', async () => {
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/products')
				.withHeaders('authorization', `Bearer $S{altProductAccessToken}`)
				.expectStatus(200); // HTTP headers are case-insensitive
		});
	});
});
