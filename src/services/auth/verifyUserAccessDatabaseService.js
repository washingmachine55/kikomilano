import pool from "../config/db.js";

export default async function verifyUserAccessFromDatabase(userId) {
	const conn = await pool.getConnection();

	try {
		const queryCheck = await conn.query("SELECT CASE WHEN EXISTS(SELECT is_verified FROM geo_news.users WHERE id = ? AND is_verified = 1) THEN 1 ELSE 0 END AS ExistsCheck;", userId);

		let result = queryCheck[0].ExistsCheck.toString();

		if (result == 1) {
			return true;
		} else {
			return false;
		}

	} catch (err) {
		console.error("Error verifying user:", err)
	} finally {
		conn.end()
	}
}