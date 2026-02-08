import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
// import console.debug from '../../utils/customLogger.js';

export async function isCredentialsMatching(userEmail, userPassword) {
	const conn = await pool.connect();

	try {
		const credentialsCheck = await conn.query(
			'SELECT CASE WHEN EXISTS(SELECT email FROM tbl_users WHERE email = $1) THEN 1 ELSE 0 END AS ExistsCheck;',
			[userEmail]
		);

		let result = credentialsCheck.rows[0].existscheck.toString();

		try {
			if (result == 1) {
				const getHashedPasswordFromDB = await conn.query(
					'SELECT password_hash FROM tbl_users WHERE email = $1;',
					[userEmail]
				);

				const hashedPasswordFromDB = Object.values(getHashedPasswordFromDB.rows[0])[0];
				const bcryptResult = await bcrypt.compare(userPassword, hashedPasswordFromDB);

				if (bcryptResult == true) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} catch (error) {
			console.debug('An error occurred', error);
		}
	} catch (err) {
		console.debug('Error reading record:', err);
	} finally {
		conn.release();
	}
}

export async function getUserId(userEmail, userPassword) {
	const conn = await pool.connect();

	try {
		const credentialsCheck = await conn.query(
			'SELECT CASE WHEN EXISTS(SELECT email FROM tbl_users WHERE email = $1) THEN 1 ELSE 0 END AS ExistsCheck;',
			[userEmail]
		);

		let result = credentialsCheck.rows[0].existscheck.toString();

		try {
			if (result == 1) {
				const getHashedPasswordFromDB = await conn.query(
					'SELECT password_hash FROM tbl_users WHERE email = $1;',
					[userEmail]
				);
				const hashedPasswordFromDB = Object.values(getHashedPasswordFromDB.rows[0])[0];
				const bcryptResult = await bcrypt.compare(userPassword, hashedPasswordFromDB);

				if (bcryptResult == true) {
					// const credentialsCheck = await conn.query("SELECT id FROM tbl_users WHERE email = $1;", [userEmail]);
					const credentialsCheck = await conn.query(
						'SELECT u.id, u.email, u.access_type, u.created_at, ud.first_name, ud.last_name, ud.images_id from tbl_users u JOIN tbl_users_details ud ON ud.users_id = u.id WHERE u.email = $1;',
						[userEmail]
					);
					let result = credentialsCheck.rows[0];
					return result;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} catch (error) {
			console.debug('An error occurred', error);
		}
	} catch (err) {
		console.debug('Error reading record:', err);
	} finally {
		conn.release();
	}
}
