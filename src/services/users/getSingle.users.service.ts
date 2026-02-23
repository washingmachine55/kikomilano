import pool from '@config/db.js';
import { GET_ALL_USER_DETAILS_BY_ID } from '../../providers/commonQueries.providers.js';

export async function getSingleUserDetails(userId) {
	// const conn = await pool.connect();

	try {
		const result = await pool.query(GET_ALL_USER_DETAILS_BY_ID, [userId]);
		return result.rows[0];
	} catch (err) {
		console.error('Error creating record:', err);
	}
	// finally {
	// 	conn.release();
	// }
}
