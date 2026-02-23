import { getAllProductsDetails } from '@services/products/getAll.products.service.js';
import { getAllProductsVariants } from '@services/products/getAllVariants.products.service.js';
import { attempt, NotFoundError } from '@utils/errors.js';
import { responseWithStatus } from '@utils/responses.js';
import type { NextFunction, Response, Request } from 'express';

export const getAllProducts = attempt(async (req: Request, res: Response, _next: NextFunction) => {
	if (req.query.category !== undefined) {
		const result = await getAllProductsDetails(req.query['category']);
		if (!result) {
			await responseWithStatus(res, 1, 404, 'That category does not exist.');
		} else {
			await responseWithStatus(
				res,
				1,
				200,
				'Details of all available products of the selected category.',
				result
			);
		}
	} else {
		const result = await getAllProductsDetails();
		await responseWithStatus(res, 1, 200, 'Details of all available products.', {
			products_details: result,
		});
	}
});

export const getAllProductVariants = attempt(async (req: Request, res: Response, _next: NextFunction) => {
	// const parsedParam = req.params.productId.trim()

	const result = await getAllProductsVariants(req.params.productId);
	if (result === false) {
		throw new NotFoundError(
			'No product variants found of this product id.',
			'It is likely that the product id does not exist, please recheck the Product ID from the /products endpoint'
		);
	} else {
		await responseWithStatus(res, 1, 200, 'Details of all available product variants.', result);
	}
});
