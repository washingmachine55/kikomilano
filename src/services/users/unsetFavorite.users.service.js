import pool from '../../config/db.js';
import { RecordCheck } from '../../providers/recordChecks.providers.js';
import { NotFoundError } from '../../utils/errors.js';

export async function deleteProductFavorite(userId, productVariantId) {
	// const conn = await pool.connect();

	const productVariantCheck = new RecordCheck('id', 'tbl_products_variants', productVariantId).getResult();
	if ((await productVariantCheck) === false) {
		throw new NotFoundError('Product not found. Please enter a valid product variant ID');
	}
	const checkIfRecordExistsQuery = await pool.query(
		'SELECT CASE WHEN EXISTS(SELECT users_id,products_variants_id,status FROM tbl_users_products_favorites WHERE users_id = $1 AND products_variants_id = $2 AND status = 1) THEN true ELSE false END AS ExistsCheck;',
		[userId, productVariantId]
	);
	const checkIfRecordExists = checkIfRecordExistsQuery.rows[0].existscheck;

	if (checkIfRecordExists === false) {
		const checkIfPreviouslyFavourited = await pool.query(
			'SELECT CASE WHEN EXISTS(SELECT users_id,products_variants_id,status FROM tbl_users_products_favorites WHERE users_id = $1 AND products_variants_id = $2) THEN true ELSE false END AS ExistsCheck;',
			[userId, productVariantId]
		);
		const previouslyFavouritedCheck = checkIfPreviouslyFavourited.rows[0].existscheck;
		if (previouslyFavouritedCheck === false) {
			// conn.release();
			throw new NotFoundError("Product was never added to user's favorites.");
		} else {
			// conn.release();
			throw new NotFoundError('Product is already removed from favorites.');
		}
	} else {
		const result = await pool.query(
			'UPDATE tbl_users_products_favorites SET deleted_by = $1, deleted_at = NOW(), status = 0 WHERE users_id = $1 AND products_variants_id = $2 RETURNING *',
			[userId, productVariantId]
		);
		// conn.release();
		return result.rows[0];
	}
}
