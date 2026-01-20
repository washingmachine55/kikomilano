import pool from "../../config/db.js";

async function checkExistingEmail(request) {
	const conn = await pool.connect();

	try {
		const emailCheck = await conn.query("SELECT CASE WHEN EXISTS(SELECT email FROM tbl_users WHERE email = $1) THEN 1 ELSE 0 END AS ExistsCheck;", [request]);

		let result = emailCheck.rows[0].existscheck.toString()

		try {
			if (result == 1) {
				return true;
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

async function getUserIdFromExistingEmail(email) {
	const conn = await pool.getConnection();

	try {
		// const emailCheck = await conn.query("SELECT email FROM users WHERE email = ?", request);
		const emailCheck = await conn.query("SELECT CASE WHEN EXISTS(SELECT email FROM geo_news.users WHERE email = ?) THEN 1 ELSE 0 END AS ExistsCheck;", email);

		let result = emailCheck[0].ExistsCheck.toString();

		try {
			if (result == 1) {
				const userId = await conn.query("SELECT id FROM users WHERE email = ?", email);
				return Object.values(userId[0]).toString();
			} else {
				return false;
			}
		} catch (error) {
			console.log(error);
		}

	} catch (err) {
		console.error("Error creating record:", err)
	} finally {
		conn.end()
	}
}

export { checkExistingEmail, getUserIdFromExistingEmail };