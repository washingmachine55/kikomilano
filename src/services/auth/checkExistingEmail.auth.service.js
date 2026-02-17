import pool from '../../config/db.js';
import { CASE_EMAIL_CHECK } from '../../providers/commonQueries.providers.js';

export async function checkExistingEmail(request) {
	// const conn = await pool.connect();

	try {
		const emailCheck = await pool.query(
			CASE_EMAIL_CHECK,
			[request]
		);
		const result = emailCheck.rows[0].existscheck;

		if (getUserId === false) {
			if (result === true) {
				return true;
			} else {
				return false;
			}
		} else {
			if (result === true) {
				const userId = await pool.query('SELECT id FROM tbl_users WHERE email = $1', [request]);
				return userId.rows[0].id;
			} else {
				throw new Error('No user found');
			}
		}
	} catch (err) {
		console.error('Error creating record:', err);
	} 
	// finally {
	// 	conn.release();
	// }
}

export async function checkExistingEmail_v2(request) {
	const emailCheck = await pool.query(
		CASE_EMAIL_CHECK,
		[request]
	);
	if (emailCheck.rows[0].existscheck === true) {
		return true
	} else {
		return false
	}
}