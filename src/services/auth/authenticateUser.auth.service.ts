import pool from '@config/db';
import bcrypt from 'bcryptjs';
import { CASE_EMAIL_CHECK, GET_ALL_USER_DETAILS_BY_EMAIL } from '../../providers/commonQueries.providers';
import type { QueryResult } from 'pg';

export async function isCredentialsMatching(userEmail: string, userPassword: string) {
	// const conn = await pool.connect();

	try {
		const credentialsCheck = await pool.query(CASE_EMAIL_CHECK, [userEmail]);

		let result = credentialsCheck.rows[0].existscheck;

		try {
			if (result === true) {
				const getHashedPasswordFromDB: QueryResult<any> = await pool.query(
					'SELECT password_hash FROM tbl_users WHERE email = $1;',
					[userEmail]
				);

				const hashedPasswordFromDB = Object.values(getHashedPasswordFromDB.rows[0])[0];
				const bcryptResult = await bcrypt.compare(userPassword, hashedPasswordFromDB).catch((err) => {
					throw new Error("Error occurred while trying to encrypt user's password", { cause: err });
				});

				if (bcryptResult === true) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} catch (error) {
			console.debug('An error occurred', error);
			throw new Error('An error occurred', { cause: error });
		}
	} catch (err) {
		console.debug('Error reading record:', err);
		throw new Error('An error occurred', { cause: err });
	}
	// finally {
	// 	// conn.release();
	// }
}

export async function getUserId(userEmail: string, userPassword: string) {
	// const conn = await pool.connect();

	try {
		const credentialsCheck = await pool.query(CASE_EMAIL_CHECK, [userEmail]);

		let result = credentialsCheck.rows[0].existscheck;

		try {
			if (result === true) {
				const getHashedPasswordFromDB = await pool.query(
					'SELECT password_hash FROM tbl_users WHERE email = $1;',
					[userEmail]
				);
				const hashedPasswordFromDB = Object.values(getHashedPasswordFromDB.rows[0])[0];
				const bcryptResult = await bcrypt.compare(userPassword, hashedPasswordFromDB);

				if (bcryptResult == true) {
					const credentialsCheck = await pool.query(GET_ALL_USER_DETAILS_BY_EMAIL, [userEmail]);
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
	}
	// finally {
	// 	conn.release();
	// }
}
