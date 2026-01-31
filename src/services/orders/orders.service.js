import pool from '../../config/db.js';
import { RecordCheck } from "../../providers/recordChecks.providers.js";
import { NotFoundError } from '../../utils/errors.js';
import format from 'pg-format';

export async function saveOrder(data) {
	const conn = await pool.connect();

	try {
		const userCheck = new RecordCheck("id", "tbl_users", data.users_id)
		if (await userCheck.getResult() === false) {
			throw new NotFoundError("User does not exist in database. Please create a new account");
		} else {
			await conn.query('BEGIN')
			const newOrderID = await conn.query('INSERT INTO tbl_orders(users_id, cart_total) VALUES ($1, $2) RETURNING id', [data.users_id, Number(data.cart_total)])
			const currentTimestamp = new Date();

			const productsOfUserOrder = []
			data.products.forEach(product_variant => {
				productsOfUserOrder.push(Object.values(product_variant))
			});
			for (let i = 0; i < productsOfUserOrder.length; i++) {
				productsOfUserOrder[i].push(newOrderID.rows[0].id, data.users_id, 'NOW()')
			}
			const finalQuery = format("INSERT INTO tbl_orders_products(products_variants_id, quantity, orders_id,  created_by, created_at) VALUES %L", productsOfUserOrder)
	
			const result = await conn.query(finalQuery);
			// (async () => {
			// })();

			await conn.query('COMMIT')
			return result.rows
			
			// productsOfUserOrder.forEach(x => {
			// 	conn.query("INSERT INTO tbl_orders_products (orders_id, products_variants_id, quantity, created_by, created_at)", productsOfUserOrder[x])
			// });
				// conn.query('BEGIN')
			// await conn.query
		}

	} catch (err) {
		await conn.query('ROLLBACK')
		console.log(err);
		throw new Error(err);
	} finally {
		conn.release();
	}
	
}