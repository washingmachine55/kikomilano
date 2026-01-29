import pool from '../../config/db.js';

export async function saveProductFavorite(userId, productVariantId) {
	const conn = await pool.connect();

	try {
		const checkIfRecordExistsQuery = await conn.query(
			'SELECT CASE WHEN EXISTS(SELECT users_id,products_variants_id,status FROM tbl_users_products_favorites WHERE users_id = $1 AND products_variants_id = $2 AND status = 1) THEN 1 ELSE 0 END AS ExistsCheck;',
			[userId, productVariantId]
		);
		const checkIfRecordExists = checkIfRecordExistsQuery.rows[0].existscheck.toString();
		if (checkIfRecordExists == 1) {
			return false
		} else {
			const result = await conn.query(
				'INSERT INTO tbl_users_products_favorites(users_id, products_variants_id,created_by, created_at) VALUES ($1,$2,$1,NOW()) RETURNING *;',
				[userId, productVariantId]
			);
			return result.rows[0];
		}
	} catch (err) {
		console.error('Error setting product as a favorite:', err);
		return false;
	} finally {
		conn.release();
	}
	
}