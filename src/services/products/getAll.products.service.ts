import pool from '@config/db.js';
import { NotFoundError } from '../../utils/errors.js';
import { getAllCategoriesDetails } from '../categories/getAll.categories.service.js';

export async function getAllProductsDetails(categoriesName: string | undefined = undefined) {
	// const conn = await pool.connect();

	const allAvailableCategories: Array<string> = await getAllCategoriesDetails();
	const allCategories: string[] = [];
	allAvailableCategories.forEach((element: any) => {
		allCategories.push(element.name.toLowerCase());
	});

	try {
		if (categoriesName !== undefined) {
			if (allCategories.includes(categoriesName.toLowerCase())) {
				// fix this lines
				const result = await pool.query(`
					SELECT p.id AS product_id, p.name AS product_name, pv.id AS product_variant_id, pv.name AS product_variant_name, p.rating , c.name AS companies_name, cg.name AS categories_name, cg.id AS categories_id, pv.price_retail, i.image_url
					FROM tbl_products p
					JOIN tbl_products_variants pv ON pv.products_id = p.id
					JOIN tbl_companies c ON c.id = p.companies_id
					JOIN tbl_categories cg ON cg.id = p.categories_id
					FULL JOIN tbl_images i ON i.id = pv.images_id
					WHERE pv.main = TRUE AND lower(cg.name) = lower('${categoriesName.toLowerCase()}')
					ORDER BY p.id ASC
				;`);
				result.rows;
			}
		} else {
			const result = await pool.query(`
				SELECT p.id AS product_id, p.name AS product_name, pv.id AS product_variant_id, pv.name AS product_variant_name, p.rating, c.name AS companies_name, cg.name AS categories_name, cg.id AS categories_id, pv.price_retail, i.image_url
				FROM tbl_products p
				JOIN tbl_products_variants pv ON pv.products_id = p.id
				JOIN tbl_companies c ON c.id = p.companies_id
				JOIN tbl_categories cg ON cg.id = p.categories_id
				FULL JOIN tbl_images i ON i.id = pv.images_id
				WHERE pv.main = TRUE
				ORDER BY p.id ASC
			;`);
			result.rows;
		}
	} catch (err) {
		console.error('Error reading record:', err);
		throw new NotFoundError('Error getting all products', { cause: err });
	}
}
