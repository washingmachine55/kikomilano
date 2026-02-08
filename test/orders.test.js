import pactum from 'pactum';
import * as pm from 'pactum-matchers';
import { randomInt } from 'node:crypto';

process.loadEnvFile();
pactum.request.setBaseUrl(process.env.APP_URL);
pactum.request.setDefaultHeaders({ 'Content-Type': 'application/json' });

describe('Orders APIs', () => {
	let accessToken;
	let userId;
	let productVariantId;

	// Setup: Login to get access token and store user ID
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
						"email": "admin${randomNum}@admin.com",
						"password": "Passw*rd1",
						"confirmed_password": "Passw*rd1"
					}
				}
			`
			)
			.stores('orderAccessToken', 'data.access_token')
			.stores('orderUserId', 'data.user_details.id');

		// Get a valid product variant ID from products endpoint
		await pactum
			.spec()
			.withMethod('GET')
			.withPath('/products')
			.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
			.stores('testProductVariantId', `data.products_details[${randomNum}].product_variant_id`)
			.stores('altTestProductVariantId', `data.products_details[${randomNum}].product_variant_id`);
	});

	describe('POST /orders', () => {
		it('should create order successfully with valid data', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"users_id": "$S{orderUserId}",
							"products": [
								{
									"products_variants_id": "$S{testProductVariantId}",
									"qty": 2
								}
							],
							"cart_total": 199.98,
							"checkout_complete": false
						}
					}
				`
				)
				.expectStatus(200)
				.expectJsonLike({
					message: 'Order created successfully',
				})
				.expectJsonMatch({
					type: 1,
					status: 200,
				});
		});

		it('should fail to create order without authentication token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withBody(
					`
					{
						"data": {
							"users_id": "some-user-id",
							"products": [
								{
									"product_variant_id": "product-id",
									"qty": 1
								}
							],
							"cart_total": 99.99,
							"checkout_complete": "pending"
						}
					}
				`
				)
				.expectStatus(401);
		});

		it('should fail to create order with invalid token', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', 'Bearer invalid_token_here')
				.withBody(
					`
					{
						"data": {
							"users_id": "some-user-id",
							"products": [],
							"cart_total": 99.99,
							"checkout_complete": "pending"
						}
					}
				`
				)
				.expectStatus(401);
		});

		it('should fail to create order with invalid users_id format', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"users_id": "invalid-uuid-format",
							"products": [
								{
									"product_variant_id": "$S{testProductVariantId}",
									"qty": 1
								}
							],
							"cart_total": 99.99,
							"checkout_complete": "pending"
						}
					}
				`
				)
				.expectStatus(400);
		});

		it('should fail to create order with missing users_id', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"products": [
								{
									"product_variant_id": "$S{testProductVariantId}",
									"qty": 1
								}
							],
							"cart_total": 99.99,
							"checkout_complete": "pending"
						}
					}
				`
				)
				.expectStatus(400);
		});

		it('should fail to create order with empty order items', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"users_id": "$S{orderUserId}",
							"products": [],
							"cart_total": 0,
							"checkout_complete": false
						}
					}
				`
				)
				.expectStatus(400);
		});

		it('should fail to create order with negative qty', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"users_id": "$S{orderUserId}",
							"products": [
								{
									"product_variant_id": "$S{testProductVariantId}",
									"qty": -1
								}
							],
							"cart_total": -99.99,
							"checkout_complete": "pending"
						}
					}
				`
				)
				.expectStatus(400);
		});

		it('should fail to create order with invalid product variant ID', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"users_id": "$S{orderUserId}",
							"products": [
								{
									"product_variant_id": "00000000-0000-0000-0000-000000000000",
									"qty": 1
								}
							],
							"cart_total": 99.99,
							"checkout_complete": "pending"
						}
					}
				`
				)
				.expectStatus(400);
		});
	});

	describe('POST /orders - Edge Cases', () => {
		xit('should handle order with multiple items', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"users_id": "$S{orderUserId}",
							"products": [
								{
									"products_variants_id": "$S{testProductVariantId}",
									"qty": 2
								},
								{
									"products_variants_id": "$S{altTestProductVariantId}",
									"qty": 1,
									"price": 49.99
								}
							],
							"cart_total": 249.97,
							"checkout_complete": "pending"
						}
					}
				`
				)
				.expectStatus(200);
		});

		it('should handle order with large qty', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"users_id": "$S{orderUserId}",
							"products": [
								{
									"products_variants_id": "$S{testProductVariantId}",
									"qty": 1000
								}
							],
							"cart_total": 99990,
							"checkout_complete": "pending"
						}
					}
				`
				)
				.expectStatus(400);
		});

		it('should handle order with different status values', async () => {
			await pactum
				.spec()
				.withMethod('POST')
				.withPath('/orders')
				.withHeaders('Authorization', `Bearer $S{orderAccessToken}`)
				.withBody(
					`
					{
						"data": {
							"users_id": "$S{orderUserId}",
							"products": [
								{
									"products_variants_id": "$S{testProductVariantId}",
									"qty": 1
								}
							],
							"cart_total": 99.99,
							"checkout_complete": "completed"
						}
					}
				`
				)
				.expectStatus(200);
		});
	});
});
