import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { CASE_EMAIL_CHECK, GET_ALL_USER_DETAILS_BY_EMAIL } from '../../providers/commonQueries.providers.js';

export async function isCredentialsMatching(userEmail, userPassword) {
	const conn = await pool.connect();

	try {
		const credentialsCheck = await conn.query(
			CASE_EMAIL_CHECK,
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
			CASE_EMAIL_CHECK,
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
					const credentialsCheck = await conn.query(
						GET_ALL_USER_DETAILS_BY_EMAIL,
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
