import pool from '@config/db.js';

export async function uploadUserProfilePictureToDB(userId, file) {
	const fileToUpload = file.path.replace('public/', '');
	const conn = await pool.connect();
	try {
		await conn.query('BEGIN');
		const uploadImage = await conn.query(
			'INSERT INTO tbl_images(image_url,created_by) VALUES ($1,$2) RETURNING id',
			[fileToUpload, userId]
		);

		const uploadImageResult = uploadImage.rows[0].id;
		await conn.query('UPDATE tbl_users_details SET images_id = $1 WHERE users_id = $2 RETURNING images_id', [
			uploadImageResult,
			userId,
		]);
		await conn.query('COMMIT');

		const result = await conn
			.query(
				`
			SELECT ud.users_id, i.image_url
			FROM tbl_users_details ud
			JOIN tbl_images i ON ud.images_id = i.id
			WHERE ud.users_id = $1
		`,
				[userId]
			)
			.catch((err) => {
				throw new Error("Unable to fetch user's profile picture");
			});

		return result.rows[0];
	} catch (err) {
		await conn.query('ROLLBACK');
		console.error('Error creating record:', err);
	} finally {
		conn.release();
	}
}
