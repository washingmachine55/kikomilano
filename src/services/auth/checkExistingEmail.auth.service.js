import pool from '../../config/db.js';
import { CASE_EMAIL_CHECK } from '../../providers/commonQueries.providers.js';

export async function checkExistingEmail(request, getUserId = false) {
	const conn = await pool.connect();

	try {
		const emailCheck = await conn.query(
			CASE_EMAIL_CHECK,
			[request]
		);
		let result = emailCheck.rows[0].existscheck.toString();

		if (getUserId === false) {
			if (result == 1) {
				return true;
			} else {
				return false;
			}
		} else {
			if (result == 1) {
				const userId = await conn.query('SELECT id FROM tbl_users WHERE email = $1', [request]);
				return userId.rows[0].id;
			} else {
				throw new Error('No user found');
			}
		}
	} catch (err) {
		console.error('Error creating record:', err);
	} finally {
		conn.release();
	}
}

// async function getUserIdFromExistingEmail(email) {
// 	const conn = await pool.getConnection();

// 	try {
// 		// const emailCheck = await conn.query("SELECT email FROM users WHERE email = ?", request);
// 		const emailCheck = await conn.query(
// 			'SELECT CASE WHEN EXISTS(SELECT email FROM geo_news.users WHERE email = ?) THEN 1 ELSE 0 END AS ExistsCheck;',
// 			email
// 		);

// 		let result = emailCheck[0].ExistsCheck.toString();

// 		try {
// 			if (result == 1) {
// 				const userId = await conn.query('SELECT id FROM users WHERE email = ?', email);
// 				return Object.values(userId[0]).toString();
// 			} else {
// 				return false;
// 			}
// 		} catch (error) {
// 			console.log(error);
// 		}
// 	} catch (err) {
// 		console.error('Error creating record:', err);
// 	} finally {
// 		conn.end();
// 	}
// }
