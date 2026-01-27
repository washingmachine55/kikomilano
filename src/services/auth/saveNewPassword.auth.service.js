import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { SOMETHING_WENT_WRONG_CREATE } from '../../utils/CONSTANTS.js';

export default async function saveNewUserPasswordToDB(userEmail, userPassword) {
	const conn = await pool.connect();

	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(userPassword, salt);
		await conn.query('UPDATE tbl_users SET password_hash = $1 WHERE email = $2 RETURNING id', [hashedPassword, userEmail]);

		const userDetails = await conn.query(
			'SELECT u.id, u.email, u.access_type, u.created_at, ud.first_name, ud.last_name, ud.profile_pic_url from tbl_users u JOIN tbl_users_details ud ON ud.users_id = u.id WHERE u.email = $1;',
			[userEmail]
		);

		return userDetails.rows[0];
	} catch (err) {
		console.error('Error creating record:', err);
	} finally {
		conn.release();
	}
}
