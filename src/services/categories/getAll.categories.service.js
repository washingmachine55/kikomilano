import pool from '../../config/db.js';

export async function getAllCategoriesDetails() {
	const conn = await pool.connect();

	try {
		const result = await conn.query(`SELECT id, name FROM tbl_categories;`);

		return result.rows;
	} catch (err) {
		console.error('Error reading record:', err);
	} finally {
		conn.release();
	}
}
