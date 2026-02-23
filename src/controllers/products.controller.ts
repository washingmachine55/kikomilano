import { getAllProductsDetails } from '../services/products/getAll.products.service.js';
import { getAllProductsVariants } from '../services/products/getAllVariants.products.service.js';
import { attempt, NotFoundError } from '../utils/errors.js';
import { responseWithStatus } from '../utils/responses.js';

export const getAllProducts = await attempt(async (req, res, next) => {
	if (req.query.category !== undefined) {
		const result = await getAllProductsDetails(req.query.category);
		if (!result) {
			return await responseWithStatus(res, 1, 404, 'That category does not exist.');
		} else {
			return await responseWithStatus(
				res,
				1,
				200,
				'Details of all available products of the selected category.',
				result
			);
		}
	} else {
		const result = await getAllProductsDetails();
		return await responseWithStatus(res, 1, 200, 'Details of all available products.', {
			products_details: result,
		});
	}
});

export const getAllProductVariants = await attempt(async (req, res, next) => {
	// const parsedParam = req.params.productId.trim()

	const result = await getAllProductsVariants(req.params.productId);
	if (result === false) {
		throw new NotFoundError(
			'No product variants found of this product id.',
			'It is likely that the product id does not exist, please recheck the Product ID from the /products endpoint'
		);
	} else {
		return await responseWithStatus(res, 1, 200, 'Details of all available product variants.', result);
	}
});
