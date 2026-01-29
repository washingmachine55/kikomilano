import pool from '../../config/db.js';

export async function deleteProductFavorite(userId, productVariantId) {
	const conn = await pool.connect();

	try {
		const checkIfRecordExistsQuery = await conn.query(
			'SELECT CASE WHEN EXISTS(SELECT users_id,products_variants_id,status FROM tbl_users_products_favorites WHERE users_id = $1 AND products_variants_id = $2 AND status = 1) THEN 1 ELSE 0 END AS ExistsCheck;',
			[userId, productVariantId]
		);
		const checkIfRecordExists = checkIfRecordExistsQuery.rows[0].existscheck.toString();
		if (checkIfRecordExists == 0) {
			return false
		} else {
			const result = await conn.query(
				'UPDATE tbl_users_products_favorites SET deleted_by = $1, deleted_at = NOW(), status = 0 WHERE users_id = $1 AND products_variants_id = $2 RETURNING *',
				[userId, productVariantId]
			);
			return result.rows[0];
		}
	} catch (err) {
		console.error('Error unsetting product as a favorite:', err);
		return false;
	} finally {
		conn.release();
	}
	
}