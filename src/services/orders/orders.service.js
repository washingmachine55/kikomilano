import pool from '../../config/db.js';
import { RecordCheck } from "../../providers/recordChecks.providers.js";
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import format from 'pg-format';
import { extractedUuidSchema, UUIDSchema } from '../../utils/schema.validations.js';
import { isValidUUID } from '../../utils/validateUUID.js';

export async function saveOrder(data) {
	const conn = await pool.connect();

	// try {
	const userCheck = new RecordCheck("id", "tbl_users", data.users_id)
	await userCheck.confirmFromWhitelist()

	if (await userCheck.getResult() === false) {
		throw new NotFoundError("User does not exist in database. Please create a new account");
	} else {
		await conn.query('BEGIN')

		if (Number(data.cart_total) > 9999 || Number(data.cart_total) < 1) {
			throw new ValidationError(`Applied cart total must be above 0 and less than 9999, currently ${data.cart_total}. Please retry after making the necessary changes.`);
		}

		const newOrderID = await conn.query('INSERT INTO tbl_orders(users_id, cart_total, created_by) VALUES ($1, $2, $1) RETURNING *', [data.users_id, Number(data.cart_total)])

		if (Object.hasOwn(data, "discount_code") && data.discount_code !== null) {
			const discountCheck = new RecordCheck("id", "tbl_discounts", data.discount_code)
			await discountCheck.getResult()
				.catch(err => { throw new NotFoundError(`Error finding discount code ${data.discount_code} in database`, { cause: err }) })
			if (await discountCheck.getResult() === false) {
				throw new NotFoundError(`Applied discount code ${data.discount_code} does not exist in the database, please remove or apply a valid discount code.`);
			}
		}

		const productsOfUserOrder = []
		if (Object.hasOwn(data, "products") && Object.values(data.products).length > 0) {
			data.products.forEach(product_variant => {
				if (!Object.hasOwn(product_variant, "qty")) {
					throw new ValidationError(`Quantity must be provided!`);
				}
				if (product_variant.qty <= 0 || product_variant.qty >= 20) {
					throw new ValidationError(`Applied quantity value must be above 0 and less than 20, currently ${product_variant.qty}. Please retry after making the necessary changes.`);
				}
				console.log(product_variant.qty);

				productsOfUserOrder.push(Object.values(product_variant))
			});
			for (let w = 0; w < productsOfUserOrder.length; w++) {
				const productCheck = new RecordCheck("id", "tbl_products_variants", productsOfUserOrder[w][0])
				if (await productCheck.getResult() === false) {
					throw new ValidationError("Invalid UUID, please retry again.")
				}
				await productCheck.getResult().catch((err) => { throw new NotFoundError(`Error finding product ${productsOfUserOrder[w][0]} in database`, { cause: err }) });
			}

			for (let i = 0; i < productsOfUserOrder.length; i++) {
				productsOfUserOrder[i].push(newOrderID.rows[0].id, data.users_id, 'NOW()')
			}

			const finalQuery = format("INSERT INTO tbl_orders_products(products_variants_id, quantity, orders_id, created_by, created_at) VALUES %L RETURNING *", productsOfUserOrder)
			const result = await conn.query(finalQuery).catch((err) => {
				// throw new ValidationError("Order not created", { cause: "Likely due to no products (empty array) presented in the request OR incorrect request format" });
				throw new Error("Order not created", { cause: err });
			});

			await conn.query('COMMIT')
			return data = {
				order_details: newOrderID.rows[0],
				order_products: result.rows
			}
		} else {
			await conn.query('ROLLBACK')
			conn.release();
			throw new ValidationError("Order not created. You must enter at least one product variant id to create an order");
		}
	}

	// } catch (err) {
	// 	console.log(err);
	// } finally {
	// 	conn.release();
	// }
	// if (err.code === '23503') {
	// 	throw new NotFoundError(`Product Variant ID ${await extractedUuidSchema.parseAsync(err.detail)} not found on database`);
	// }
	// if (err.name === "") {


	// throw new Error(err.message, { cause: err });
}