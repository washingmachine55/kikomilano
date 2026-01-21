import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import { SOMETHING_WENT_WRONG_CREATE } from "../../utils/CONSTANTS.js";

export default async function registerUserToDatabase(request) {
	const conn = await pool.connect();

	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(request[2], salt);

		const detailsToSave = [request[1], hashedPassword]
		const saveToDB = await conn.query("INSERT INTO tbl_users(email,password_hash) VALUES ($1, $2) RETURNING id", detailsToSave);

		if (!saveToDB) {
			return Error(SOMETHING_WENT_WRONG_CREATE)
		} else {
			const usernameArray = request[0].split(" ")
			const filteredUsernameArray = usernameArray.filter((word) => word.length >= 1);

			const firstName = filteredUsernameArray[0]
			const lastName = filteredUsernameArray[filteredUsernameArray.length - 1]

			const userDetailsToSave = [saveToDB.rows[0].id, firstName, lastName]
			await conn.query(`INSERT INTO tbl_users_details(users_id,first_name,last_name) VALUES ($1, $2, $3) RETURNING id`, userDetailsToSave);

			return saveToDB.rows[0];
		}

	} catch (err) {
		console.error("Error creating record:", err)
	} finally {
		conn.release()
	}
}