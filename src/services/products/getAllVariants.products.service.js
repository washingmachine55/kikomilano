import pool from '../../config/db.js';
import { getAllCategoriesDetails } from '../categories/getAll.categories.service.js';

export async function getAllProductsVariants(productId) {
	const conn = await pool.connect();

	try {
			const result = await conn.query(
			`
				SELECT pv.id AS products_variant_id, pv.color_code , p.name AS product_name, p.rating , c.name AS companies_name, p.price, i.image_url 
				FROM tbl_products p 
				JOIN tbl_companies c ON c.id = p.companies_id 
				JOIN tbl_tags t ON t.id = p.id 
				JOIN tbl_products_variants pv ON pv.products_id = p.id 
				FULL JOIN tbl_images i ON i.id = pv.images_id 
				WHERE p.id = ${productId}
			;`
			);
			return result.rows;
	} catch (err) {
		console.error('Error reading record:', err);
	} finally {
		conn.release();
	}
}


// SELECT p.id as products_id, p.name AS product_name, pv.id AS products_variant_id, pv.name AS product_variant_name, p.rating, av.name as color_code 
// FROM tbl_products_variants pv 
// JOIN tbl_products p ON p.id = pv.products_id 
// JOIN tbl_products_variants_attributes_values pvav ON pvav.products_variants_id = pv.id 
// JOIN tbl_attributes_values av ON av.id = pvav.attributes_values_id 
// JOIN tbl_attributes a ON a.id = av.attributes_id 
// WHERE p.id = '019c0342-4aed-7273-985f-e8074ac9c771'