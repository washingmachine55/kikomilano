import { getAllProductsDetails } from "../services/products/getAll.products.service.js";
import { getAllProductsVariants } from "../services/products/getAllVariants.products.service.js";
import { responseWithStatus } from "../utils/RESPONSES.js";

export async function getAllProducts(req, res) {
	// #swagger.tags = ['Products']
	// #swagger.summary = 'Endpoint to get all details of all products.'
	try {
		if (req.query.category !== undefined) {
			const result = await getAllProductsDetails(req.query.category);
			if (!result) {
				return await responseWithStatus(res, 1, 200, 'That category does not exist')
			} else {
				return await responseWithStatus(res, 1, 200, 'Details of all available products of the selected category', result)
			}
		} else {
			const result = await getAllProductsDetails();
			return await responseWithStatus(res, 1, 200, 'Details of all available products', result)
		}
	} catch (error) {
		console.debug(error);
	}
}

export async function getAllProductVariants(req, res) {
	// #swagger.tags = ['Products']
	// #swagger.summary = 'Endpoint to get all details of all products.'
	if (!Number(req.params.productId)) {
		return await responseWithStatus(res, 1, 400, 'Please enter a valid Product Id.')
	} else {
		const result = await getAllProductsVariants(req.params.productId);
		try {
			if (result.length < 1) {
				return await responseWithStatus(res, 1, 200, 'No product variants found of this product id', result)
			} else {
				return await responseWithStatus(res, 1, 200, 'Details of all available product variants', result)
			}
		} catch (error) {
			console.debug(error);
		}
	}
}