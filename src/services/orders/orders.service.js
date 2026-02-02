import pool from '../../config/db.js';
import { RecordCheck } from "../../providers/recordChecks.providers.js";
import { NotFoundError } from '../../utils/errors.js';
import format from 'pg-format';
import { extractedUuidSchema } from '../../utils/schema.validations.js';

export async function saveOrder(data) {
	const conn = await pool.connect();

	try {
		const userCheck = new RecordCheck("id", "tbl_users", data.users_id)
		await userCheck.confirmFromWhitelist()

		if (await userCheck.getResult() === false) {
			throw new NotFoundError("User does not exist in database. Please create a new account");
		} else {
			await conn.query('BEGIN')
			const newOrderID = await conn.query('INSERT INTO tbl_orders(users_id, cart_total, created_by) VALUES ($1, $2, $1) RETURNING *', [data.users_id, Number(data.cart_total)])

			const productsOfUserOrder = []
			data.products.forEach(product_variant => {
				productsOfUserOrder.push(Object.values(product_variant))
			});
			for (let w = 0; w < productsOfUserOrder.length; w++) {
				const productCheck = new RecordCheck("id", "tbl_products_variants", productsOfUserOrder[w][0])
				await productCheck.getResult().catch(err => { throw new NotFoundError(`Error finding product ${productsOfUserOrder[w][0]} in database`, { cause: err }) });
			}


			if (data.discount_code !== null) {
				const discountCheck = new RecordCheck("id", "tbl_discounts", data.discount_code)
				await discountCheck.getResult()
					.catch(err => { throw new NotFoundError(`Error finding discount code ${data.discount_code} in database`, { cause: err }) })
				if (await discountCheck.getResult() === false) {
					throw new NotFoundError(`Applied discount code ${data.discount_code} does not exist in the database, please remove or apply a valid discount code.`);
				}
			}

			for (let i = 0; i < productsOfUserOrder.length; i++) {
				productsOfUserOrder[i].push(newOrderID.rows[0].id, data.users_id, 'NOW()')
			}

			const finalQuery = format("INSERT INTO tbl_orders_products(products_variants_id, quantity, orders_id, created_by, created_at) VALUES %L RETURNING *", productsOfUserOrder)
			const result = await conn.query(finalQuery);

			await conn.query('COMMIT')
			return data = {
				order_details: newOrderID.rows[0],
				order_products: result.rows
			}
		}

	} catch (err) {
		await conn.query('ROLLBACK')
		console.log(err);
		if (err.code === '23503') {
			throw new NotFoundError(`Product Variant ID ${await extractedUuidSchema.parseAsync(err.detail)} not found on database`);
		}
		throw new Error(err.message, { cause: err });
	} finally {
		conn.release();
	}
}