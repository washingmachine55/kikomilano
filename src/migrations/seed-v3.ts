import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import pool from '../config/db.ts';

/* =========================
	CONFIG
========================= */
const SCALE = {
	USERS: 50,
	COMPANIES: 10,
	PRODUCTS: 40,
	VARIANTS_PER_PRODUCT: { min: 4, max: 7 },
	ORDERS_PER_USER: { min: 0, max: 5 },
};

const SOFT_DELETE_RATE = 0.05; // 5%
const SALT_ROUNDS = 10;

// Optional determinism (you can remove this line if you want pure randomness)
faker.seed(42);

/* =========================
	HELPERS
========================= */
const maybeSoftDelete = () =>
	Math.random() < SOFT_DELETE_RATE
		? {
				deleted_at: faker.date.past(),
				deleted_by: null,
				status: 1,
			}
		: { deleted_at: null, deleted_by: null, status: 0 };

const pick = (arr: Array<string>) => arr[Math.floor(Math.random() * arr.length)];

async function insert(client, sql, params) {
	const { rows } = await client.query(sql, params);
	return rows[0];
}

/* =========================
	SEED
========================= */
(async () => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		await client.query("INSERT INTO tbl_categories(name) VALUES('FACE'), ('HAIR'), ('SKIN'), ('BODY')");
		await client.query(
			"INSERT INTO tbl_tags(name) VALUES('Cruelty Free'), ('Paraben Free'), ('Vegan'), ('Suitable for Sensitive Skin'), ('Dermatologist Tested')"
		);
		await client.query("INSERT INTO tbl_payments_providers (name) VALUES ('Stripe')");
		const attributesStaticQuery = await client.query(
			"INSERT INTO tbl_attributes(name) VALUES('Color Code') RETURNING id"
		);

		// for (let av = 1; av < 7; av++) {
		// 	avArray.push(faker.color.rgb({ format: 'hex', casing: 'lower' }))
		// }

		const avArray = [];
		for (let i = 0; i < 7; i++) {
			avArray.push(faker.color.rgb({ format: 'hex', casing: 'lower' }));
			const a = await insert(
				client,
				`
				INSERT INTO tbl_attributes_values(attributes_id, name) VALUES ($1, $2)
				RETURNING *
				`,
				[attributesStaticQuery.rows[0].id, avArray[i]]
			);
		}

		/* ========= USERS ========= */
		const users = [];
		const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

		for (let i = 0; i < SCALE.USERS; i++) {
			const isAdmin = i < 3;

			const user = await insert(
				client,
				`
				INSERT INTO tbl_users
				(email, phone_no, password_hash, access_type)
				VALUES ($1,$2,$3,$4)
				RETURNING *
				`,
				[
					faker.internet.email().toLowerCase(),
					faker.datatype.boolean() ? faker.string.numeric(11) : null,
					passwordHash,
					isAdmin ? 1 : 0,
				]
			);

			users.push(user);
		}

		/* ========= ADDRESSES ========= */
		const addresses = [];
		const allowedAddressNames = ['Work', 'Home', 'Office'];
		for (let i = 0; i < SCALE.USERS; i++) {
			const a = await insert(
				client,
				`
				INSERT INTO tbl_addresses
				(address_name, street_num, street_addr, city, region, zip_code, created_by)
				VALUES ($1,$2,$3,$4,$5,$6,$7)
				RETURNING *
				`,
				[
					pick(allowedAddressNames),
					faker.location.buildingNumber(),
					faker.location.streetAddress(),
					faker.location.city(),
					faker.location.state({ abbreviated: true }),
					faker.location.zipCode('#####'),
					pick(users).id,
				]
			);
			addresses.push(a);
		}

		/* ========= IMAGES ========= */
		const images = [];
		for (let i = 0; i < 150; i++) {
			images.push(
				await insert(
					client,
					`
					INSERT INTO tbl_images (image_url, created_by)
					VALUES ($1,$2)
					RETURNING *
					`,
					[faker.image.url({ category: 'product' }), pick(users).id]
				)
			);
		}

		/* ========= USER DETAILS ========= */
		for (const user of users) {
			await client.query(
				`
				INSERT INTO tbl_users_details
				(users_id, first_name, last_name, images_id, addresses_id, created_by)
				VALUES ($1,$2,$3,$4,$5,$6)
				`,
				[
					user.id,
					faker.person.firstName(),
					faker.person.lastName(),
					pick(images).id,
					pick(addresses).id,
					user.id,
				]
			);
		}

		/* ========= COMPANIES ========= */
		const companies = [];
		for (let i = 0; i < SCALE.COMPANIES; i++) {
			companies.push(
				await insert(
					client,
					`
					INSERT INTO tbl_companies (name, created_by)
					VALUES ($1,$2)
					RETURNING *
					`,
					[faker.company.name(), pick(users).id]
				)
			);
		}

		/* ========= CATEGORIES / TAGS / ATTRIBUTES ========= */
		const categories = (await client.query(`SELECT * FROM tbl_categories`)).rows;
		const tags = (await client.query(`SELECT * FROM tbl_tags`)).rows;
		const attributes = (await client.query(`SELECT * FROM tbl_attributes`)).rows;

		// const attributeValues = [];
		// for (const attr of attributes) {
		// 	attributeValues.push(
		// 		await insert(
		// 			client,
		// 			`
		// 			INSERT INTO tbl_attributes_values (attributes_id, name)
		// 			VALUES ($1,$2)
		// 			ON CONFLICT DO NOTHING
		// 			RETURNING *
		// 			`,
		// 			[attr.id, faker.color.rgb({ format: 'hex', casing: 'lower' })]
		// 		)
		// 	);
		// }

		/* ========= PRODUCTS ========= */
		const products = [];
		const variants = [];
		const productVariants = [];

		for (let i = 0; i < SCALE.PRODUCTS; i++) {
			const product = await insert(
				client,
				`
				INSERT INTO tbl_products
				(name, companies_id, categories_id, rating, details, ingredients, instructions, created_by)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
				RETURNING *
				`,
				[
					faker.commerce.productName(),
					pick(companies).id,
					pick(categories).id,
					faker.number.int({ min: 3, max: 5 }),
					faker.lorem.paragraph(),
					faker.lorem.words(8),
					faker.lorem.sentences(2),
					pick(users).id,
				]
			);

			products.push(product);

			const variantCount = faker.number.int(SCALE.VARIANTS_PER_PRODUCT);
			let mainSet = false;

			for (let v = 0; v < variantCount; v++) {
				const isMain = !mainSet;
				mainSet = true;

				const variant = await insert(
					client,
					`
					INSERT INTO tbl_products_variants
					(products_id, main, name, images_id, sku, quantity_stock, price_cost, price_retail)
					VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
					RETURNING *
					`,
					[
						product.id,
						isMain,
						faker.commerce.productAdjective(),
						pick(images).id,
						faker.string.alphanumeric(8).toUpperCase(),
						faker.number.int({ min: 1, max: 9 }),
						faker.commerce.price({ min: 5, max: 30 }),
						faker.commerce.price({ min: 30, max: 80 }),
					]
				);

				variants.push(variant);
				productVariants.push(variant);

				/* ========= ATTRIBUTE VALUES ========= */
				// for (const attr of attributes) {
				// 	// const values = ['Red', 'Blue', 'Green', 'Black', 'White'];

				// 	// for (const value of values) {
				// 		await client.query(
				// 			`
				// 			INSERT INTO tbl_attributes_values (attributes_id, name)
				// 			VALUES ($1,$2)
				// 			ON CONFLICT DO NOTHING
				// 			`,
				// 			[
				// 				attr.id,
				// 				faker.color.rgb({ format: 'hex', casing: 'lower' })
				// 			]
				// 		);
				// 	// }
				// }

				// Fetch them AFTER insertion
				const attributeValues = (await client.query(`SELECT * FROM tbl_attributes_values`)).rows;

				const productColor = pick(attributeValues);

				// assign SAME color to all variants of this product
				for (const variant of productVariants) {
					await client.query(
						`
						INSERT INTO tbl_products_variants_attributes_values
						(products_variants_id, attributes_values_id, attributes_id)
						VALUES ($1,$2,$3)
						ON CONFLICT DO NOTHING
						`,
						[variant.id, productColor.id, attributesStaticQuery.rows[0].id]
					);
				}
			}
			const tagCount = faker.number.int({ min: 4, max: 5 });
			const productTags = faker.helpers.arrayElements(tags, tagCount);
			for (const tag of productTags) {
				await client.query(
					`
				INSERT INTO tbl_products_tags (products_id, tags_id)
				VALUES ($1,$2)
				ON CONFLICT DO NOTHING
				`,
					[product.id, tag.id]
				);
			}

			// // tags
			// await client.query(
			// 	`
			// 	INSERT INTO tbl_products_tags
			// 	VALUES ($1,$2)
			// 	`,
			// 	[product.id, pick(tags).id]
			// );
		}

		/* ========= DISCOUNTS ========= */
		const discounts = [];
		for (let i = 0; i < 5; i++) {
			discounts.push(
				await insert(
					client,
					`
					INSERT INTO tbl_discounts (name, code, percent_off, created_by)
					VALUES ($1,$2,$3,$4)
					RETURNING *
					`,
					[
						faker.company.buzzVerb().padEnd('10', Math.random(Math.floor())),
						faker.string.alphanumeric(6).toUpperCase(),
						faker.number.int({ min: 5, max: 30 }),
						pick(users).id,
					]
				)
			);
		}

		/* ========= ORDERS ========= */
		const orders = [];

		for (const user of users) {
			const orderCount = faker.number.int(SCALE.ORDERS_PER_USER);

			for (let i = 0; i < orderCount; i++) {
				const orderVariants = faker.helpers.arrayElements(variants, { min: 1, max: 4 });
				let total = 0;

				for (const v of orderVariants) {
					total += Number(v.price_retail);
				}

				const discount = faker.datatype.boolean() ? pick(discounts) : null;
				if (discount?.percent_off) {
					total = total * (1 - discount.percent_off / 100);
				}

				const order = await insert(
					client,
					`INSERT INTO tbl_orders (users_id, cart_total, discounts_id, created_by) VALUES ($1,$2,$3,$4) RETURNING *`,
					[user.id, total.toFixed(2), discount?.id ?? null, user.id]
				);

				orders.push(order);

				for (const v of orderVariants) {
					await client.query(
						`
						INSERT INTO tbl_orders_products
						(orders_id, products_variants_id, quantity)
						VALUES ($1,$2,$3)
						`,
						[order.id, v.id, faker.number.int({ min: 1, max: 3 })]
					);
				}
			}
		}

		await client.query('COMMIT');
		console.log('✅ Seeding completed successfully');
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('❌ Seeding failed:', err);
	} finally {
		client.release();
		process.exit();
	}
})();
