import pool from '../../config/db.js';

export async function getAllProductsFavorites(userId) {
	const conn = await pool.connect();

	try {
		const result = await conn.query(`
			SELECT 
				p.id AS product_id, 
				p.name AS product_name, 
				upf.products_variants_id, 
				pv.name AS product_variant_name, 
				pv.price_retail, 
				i.image_url 
			FROM tbl_users_products_favorites upf 
			JOIN tbl_products_variants pv ON pv.id = upf.products_variants_id 
			JOIN tbl_images i ON i.id = pv.images_id 
			JOIN tbl_products p ON p.id = pv.products_id 
			JOIN tbl_users u ON u.id = upf.users_id 
			WHERE upf.users_id = $1 AND upf.status = 1;
			`,[userId]);
		return result.rows;
	} catch (err) {
		console.error('Error creating record:', err);
	} finally {
		conn.release();
	}
}
