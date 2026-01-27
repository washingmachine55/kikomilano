import pool from '../../config/db.js';
import { getAllCategoriesDetails } from '../categories/getAll.categories.service.js';

export async function getAllProductsDetails(categoriesName) {
	const conn = await pool.connect();

	const allAvailableCategories = await getAllCategoriesDetails()
	const allCategories = []
	allAvailableCategories.forEach(element => {
		allCategories.push(element.name.toLowerCase())
	});

	try {
		if (categoriesName !== undefined) {
			if (allCategories.includes(categoriesName.toLowerCase())) { // fix this lines
				const result = await conn.query(
					`
			SELECT p.id AS product_id, p.name AS product_name, p.rating , c.name AS companies_name, cg.name AS categories_name, cg.id AS categories_id, p.price, i.image_url 
			FROM tbl_products p 
			JOIN tbl_companies c ON c.id = p.companies_id 
			JOIN tbl_categories cg ON cg.id = p.categories_id 
			JOIN tbl_images i ON i.id = p.images_id 
			WHERE lower(cg.name) = lower('${categoriesName.toLowerCase()}')
			;`
				);
				return result.rows;
			}
		} else {

			const result = await conn.query(
				`
			SELECT p.id AS "product_id", p.name AS "product_name", p.rating , c.name AS "companies_name", cg.name AS "categories_name", cg.id AS "categories_id", p.price, i.image_url
			FROM tbl_products p 
			JOIN tbl_companies c ON c.id = p.companies_id 
			JOIN tbl_categories cg ON cg.id = p.categories_id 
			JOIN tbl_images i ON i.id = p.images_id;`
			);
			return result.rows;
		}


	} catch (err) {
		console.error('Error reading record:', err);
	} finally {
		conn.release();
	}
}