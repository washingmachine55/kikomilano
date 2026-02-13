import pool from '../../config/db.js';

export async function uploadUserProfilePictureToDB(userId, file) {
	const fileToUpload = file.path;
	// const conn = await pool.connect();
	try {
		const uploadImage = await pool.query('INSERT INTO tbl_images(image_url) VALUES ($1) RETURNING id', [
			fileToUpload.replace("public/", ""),
		]);

		const uploadImageResult = uploadImage.rows[0].id;
		await pool.query(
			'UPDATE tbl_users_details SET images_id = $1 WHERE users_id = $2 RETURNING images_id',
			[uploadImageResult, userId]
		);

		const result = await pool.query(`
			SELECT ud.users_id, i.image_url
			FROM tbl_users_details ud
			JOIN tbl_images i ON ud.images_id = i.id
		`).catch(err => {
			throw new Error("Unable to fetch user's profile picture");
		})

		return result.rows[0];
	} catch (err) {
		console.error('Error creating record:', err);
	} 
	// finally {
	// 	conn.release();
	// }
}
