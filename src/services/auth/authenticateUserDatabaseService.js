import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export async function isCredentialsMatching(userEmail, userPassword) {
	const conn = await pool.connect();

	try {
		const credentialsCheck = await conn.query("SELECT CASE WHEN EXISTS(SELECT email FROM tbl_users WHERE email = $1) THEN 1 ELSE 0 END AS ExistsCheck;", [userEmail]);

		let result = credentialsCheck.rows[0].existscheck.toString();

		try {
			if (result == 1) {
				const getHashedPasswordFromDB = await conn.query("SELECT password_hash FROM tbl_users WHERE email = $1;", [userEmail]);

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
			console.log(error);
		}

	} catch (err) {
		console.error("Error creating record:", err)
	} finally {
		conn.release()
	}
}

export async function getUserId(userEmail, userPassword) {
	const conn = await pool.connect();

	try {
		const credentialsCheck = await conn.query("SELECT CASE WHEN EXISTS(SELECT email FROM tbl_users WHERE email = $1) THEN 1 ELSE 0 END AS ExistsCheck;", [userEmail]);

		let result = credentialsCheck.rows[0].existscheck.toString();

		try {
			if (result == 1) {
				const getHashedPasswordFromDB = await conn.query("SELECT password_hash FROM tbl_users WHERE email = $1;", [userEmail]);

				const hashedPasswordFromDB = Object.values(getHashedPasswordFromDB.rows[0])[0];

				const bcryptResult = await bcrypt.compare(userPassword, hashedPasswordFromDB);

				if (bcryptResult == true) {
					const credentialsCheck = await conn.query("SELECT id FROM tbl_users WHERE email = $1;", [userEmail]);

					let result = Object.values(credentialsCheck.rows[0].id).toString()
					return result;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} catch (error) {
			console.log(error);
		}
	} catch (err) {
		console.error("Error creating record:", err)
	} finally {
		conn.release()
	}
}