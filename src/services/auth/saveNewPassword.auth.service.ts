import pool from '@config/db';
import bcrypt from 'bcryptjs';

export default async function saveNewUserPasswordToDB(userEmail = null, userPassword, userId = null) {
	// const conn = await pool.connect();

	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(userPassword, salt);
		if (userId !== null) {
			await pool.query('UPDATE tbl_users SET password_hash = $1 WHERE id = $2 RETURNING id', [
				hashedPassword,
				userId,
			]);
		} else {
			await pool.query('UPDATE tbl_users SET password_hash = $1 WHERE email = $2 RETURNING id', [
				hashedPassword,
				userEmail,
			]);
		}

		const userDetails = await pool.query(
			`
			SELECT u.id, u.email, u.access_type, u.created_at, ud.first_name, ud.last_name, i.image_url 
			FROM tbl_users u 
			JOIN tbl_users_details ud ON ud.users_id = u.id
			FULL JOIN tbl_images i ON ud.images_id = i.id
			WHERE u.email = $1;`,
			[userEmail]
		);

		return userDetails.rows[0];
	} catch (err) {
		console.error('Error resetting password for the record in request', err);
	}
	// finally {
	// 	conn.release();
	// }
}
