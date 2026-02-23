import pool from '@config/db.js';
import { NotFoundError } from '../../utils/errors.js';

export async function deleteProductFavorite(userId, productsVariantsArray) {
	// const conn = await pool.connect();
	for (let i = 0; i < productsVariantsArray.length; i++) {
		const element = productsVariantsArray[i];
		const checkIfRecordExistsQuery = await pool.query(
			'SELECT CASE WHEN EXISTS(SELECT users_id,products_variants_id,status FROM tbl_users_products_favorites WHERE users_id = $1 AND products_variants_id = $2 AND status = 1) THEN true ELSE false END AS ExistsCheck;',
			[userId, element]
		);

		const checkIfRecordExists = checkIfRecordExistsQuery.rows[0].existscheck;
		if (checkIfRecordExists === false) {
			throw new NotFoundError(`Unable to reference product with id [${element}]`);
		}
	}

	const resultArr = [];
	for (let i = 0; i < productsVariantsArray.length; i++) {
		const element = productsVariantsArray[i];
		const checkIfPreviouslyFavourited = await pool.query(
			'SELECT CASE WHEN EXISTS(SELECT users_id,products_variants_id,status FROM tbl_users_products_favorites WHERE users_id = $1 AND products_variants_id = $2 AND status = 0) THEN true ELSE false END AS ExistsCheck;',
			[userId, element]
		);

		const previouslyFavouritedCheck = checkIfPreviouslyFavourited.rows[0].existscheck;
		if (previouslyFavouritedCheck === true) {
			throw new NotFoundError("Product was never added to user's favorites.");
		} else {
			const result = await pool.query(
				'UPDATE tbl_users_products_favorites SET deleted_by = $1, deleted_at = NOW(), status = 0 WHERE users_id = $1 AND products_variants_id = $2 RETURNING *',
				[userId, element]
			);
			resultArr.push(result.rows[0]);
		}
	}

	return resultArr;
}
