import pool from '@config/db.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';

export const saveProductFavorite = async (userId, productVariantId) => {
	// const conn = await pool.connect();

	const checkIfRecordExistsQuery = await pool
		.query(
			'SELECT CASE WHEN EXISTS(SELECT users_id,products_variants_id,status FROM tbl_users_products_favorites WHERE users_id = $1 AND products_variants_id = $2 AND status = 1) THEN true ELSE false END AS ExistsCheck;',
			[userId, productVariantId]
		)
		.catch((err) => {
			throw new Error(err);
		});

	const checkIfRecordExists = checkIfRecordExistsQuery.rows[0].existscheck;

	if (checkIfRecordExists === true) {
		throw new ConflictError('Product already set as a favorite');
	} else {
		const result = await pool
			.query(
				'INSERT INTO tbl_users_products_favorites(users_id, products_variants_id,created_by, created_at) VALUES ($1,$2,$1,NOW()) RETURNING *;',
				[userId, productVariantId]
			)
			.catch((err) => {
				throw new NotFoundError('Unable to find the product you are trying to favorite');
			});

		// conn.release();
		return result.rows[0];
	}
};
