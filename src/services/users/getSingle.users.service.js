import pool from '../../config/db.js';

export async function getSingleUserDetails(userId) {
	const conn = await pool.connect();

	try {
		const result = await conn.query(
			'SELECT u.id, u.email, u.access_type, u.created_at, ud.first_name, ud.last_name, i.image_url from tbl_users u JOIN tbl_users_details ud ON ud.users_id = u.id FULL JOIN tbl_images i ON i.id = ud.images_id WHERE u.id = $1;',
			[userId]
		);
		return result.rows;
	} catch (err) {
		console.error('Error creating record:', err);
	} finally {
		conn.release();
	}
}
