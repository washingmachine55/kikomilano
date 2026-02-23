import pool from '@config/db';

export async function getAllCategoriesDetails() {
	const result = await pool.query(`SELECT id, name FROM tbl_categories;`).catch((err) => {
		throw new Error('Error reading record', { cause: err });
	});
	const endResult: object = result.rows;
	return endResult;
}
