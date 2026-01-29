import pool from '../../config/db.js';

export async function getAllProductsVariants(productId) {
	const conn = await pool.connect();
	try {
		const productCheck = await conn.query(
			'SELECT CASE WHEN EXISTS(SELECT id FROM tbl_products WHERE id = $1) THEN 1 ELSE 0 END AS ExistsCheck;',
			[productId]
		);
		let resultProductCheck = productCheck.rows[0].existscheck.toString();

		if (resultProductCheck == 1) {

			const getSpecificProduct = await conn.query(`
				SELECT p.id AS product_id, p.name AS product_name, c.name AS company_name, ct.name AS category_name, p.rating AS product_rating, p.details, p.ingredients AS whats_in_it, p.instructions AS how_to_use
				FROM tbl_products p
				JOIN tbl_categories ct ON ct.id = p.categories_id
				JOIN tbl_companies c ON c.id = p.companies_id
				WHERE p.id ='${productId}'
			`);
			const specificProductID = await getSpecificProduct.rows[0].product_id

			const getSpecificProductTags = await conn.query(`
				SELECT t.name
				FROM tbl_products p
				JOIN tbl_products_tags pt ON pt.products_id = p.id
				JOIN tbl_tags t ON t.id = pt.tags_id
				WHERE p.id = '${specificProductID}'
			`);

			const getSpecificProductsVariants = await conn.query(`
				SELECT pv.id, pv.name, main, pv.price_retail, i.image_url, av.name AS color_code
				FROM tbl_products_variants pv
				JOIN tbl_products_variants_attributes_values pvav ON pvav.products_variants_id = pv.id
				JOIN tbl_attributes_values av ON av.id = pvav.attributes_values_id
				FULL JOIN tbl_images i ON i.id = pv.images_id
				WHERE pv.products_id = '${specificProductID}'
			`);

			const tagsArr = []
			for (const element of Object.values(getSpecificProductTags.rows)) {
				tagsArr.push(element.name)
			}

			return Object({
				product_details: getSpecificProduct.rows[0],
				product_tags: tagsArr,
				product_variants: getSpecificProductsVariants.rows
			})
		} else {
			return false
		}
	} catch (err) {
		console.error('Error reading record:', err);
	} finally {
		conn.release();
	}
}