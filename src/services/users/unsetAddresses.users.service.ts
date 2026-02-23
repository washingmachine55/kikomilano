import pool from '@config/db.js';
import { NotFoundError } from '../../utils/errors.js';

export async function deleteUserAddresses(addressesArray, userId) {
	const conn = await pool.connect();

	for (let i = 0; i < addressesArray.length; i++) {
		const element = addressesArray[i];
		const result = await pool.query(
			`
			SELECT CASE WHEN EXISTS(
				SELECT a.id
				FROM tbl_addresses a
				WHERE a.id = $1 AND a.status = 1 AND deleted_at IS NULL
			)THEN true ELSE false END AS existscheck;
		`,
			[element]
		);

		if (result.rows[0].existscheck === false) {
			throw new NotFoundError(`Address ID [${element}] does not exist in database.`);
		}
	}
	try {
		await pool.query('BEGIN');

		for (let index = 0; index < addressesArray.length; index++) {
			const element = addressesArray[index];

			await conn
				.query(
					`
				UPDATE tbl_addresses
				SET status = 0, deleted_at = NOW(), deleted_by = $2
				WHERE id = $1;
			`,
					[element, userId]
				)
				.catch((err) => {
					throw new Error(err);
				});

			await conn
				.query(
					`
				DELETE FROM tbl_users_addresses WHERE addresses_id = $1 AND users_id = $2;
			`,
					[element, userId]
				)
				.catch((err) => {
					throw new Error(err);
				});
		}

		await pool.query('COMMIT');

		return {
			deleted_addresses_id: [addressesArray],
		};
	} catch (error) {
		await pool.query('ROLLBACK');
		throw new Error(error);
	} finally {
		conn.release();
	}
}
