import { getAllProductsDetails } from "../services/products/getAll.products.service.js";
import { getAllProductsVariants } from "../services/products/getAllVariants.products.service.js";
import { responseWithStatus } from "../utils/RESPONSES.js";

export async function getAllProducts(req, res) {
	// #swagger.tags = ['Products']
	// #swagger.summary = 'Endpoint to get all details of all products.'
	// #swagger.description = "It retrieves the main product's variant details, as well as the base product information."
	try {
		if (req.query.category !== undefined) {
			const result = await getAllProductsDetails(req.query.category);
			if (!result) {
				// #swagger.responses[404] = { description: 'That category does not exist.' }
				return await responseWithStatus(res, 1, 404, 'That category does not exist')
			} else {
				// #swagger.responses[200] = { description: 'Details of all available products of the selected category.' }
				return await responseWithStatus(res, 1, 200, 'Details of all available products of the selected category', result)
			}
		} else {
			const result = await getAllProductsDetails();
			// #swagger.responses[200] = { description: 'Details of all available products.' }
			return await responseWithStatus(res, 1, 200, 'Details of all available products', { products_details: result })
		}
	} catch (error) {
		console.debug(error);
	}
}

export async function getAllProductVariants(req, res) {
	// #swagger.tags = ['Products']
	// #swagger.summary = 'Endpoint to get all variants of a product with a given UUID in endpoint.'
	// #swagger.description = "It retrieves the base product's details Object, product tags Array, and an Array of Objects of all product variants of the product."
	/*  #swagger.parameters['productId'] = {
		in: 'path',
		description: 'UUID v7',
		type: 'string'
	} */

	const result = await getAllProductsVariants(req.params.productId);
	try {
		if (result.length > 1) {
			// #swagger.responses[200] = { description: 'Details of all available product variants.' }
			return await responseWithStatus(res, 1, 200, 'Details of all available product variants', result)
		} else {
			// #swagger.responses[200] = { description: 'No product variants found of this product id.' }
			return await responseWithStatus(res, 1, 404, 'No product variants found of this product id', result)
		}
	} catch (error) {
		console.debug(error);
	}
}