import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export default async function registerUserToDatabase(request) {
	const conn = await pool.connect();
	console.log(request);
	

	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(request[2], salt);

		const detailsToSave = [request[1], hashedPassword]

		const saveToDB = await conn.query("INSERT INTO tbl_users(email,password_hash) VALUES ($1, $2) RETURNING id", detailsToSave);

		return saveToDB;
	} catch (err) {
		console.error("Error creating record:", err)
	} finally {
		conn.release()
	}
}