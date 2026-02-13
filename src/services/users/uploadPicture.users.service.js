import pool from '../../config/db.js';

export async function uploadUserProfilePictureToDB(userId, file) {
	const fileToUpload = file.path;
	// const conn = await pool.connect();
	try {
		const uploadImage = await pool.query('INSERT INTO tbl_images(image_url) VALUES ($1) RETURNING id', [
			fileToUpload.replace("public/", ""),
		]);

		const uploadImageResult = uploadImage.rows[0].id;

		const result = await pool.query(
			'UPDATE tbl_users_details SET images_id = $1 WHERE users_id = $2 RETURNING images_id',
			[uploadImageResult, userId]
		);

		return result.rows[0];
	} catch (err) {
		console.error('Error creating record:', err);
	} 
	// finally {
	// 	conn.release();
	// }
}
