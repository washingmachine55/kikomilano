import { env, loadEnvFile } from 'node:process';
import { responseWithStatus } from '../utils/responses.js';
import { saveOrder } from '../services/orders/orders.service.js';
import { isValidUUID } from '../utils/validateUUID.js';
import { attempt, ValidationError } from '../utils/errors.js';
loadEnvFile();

// export async function createOrder(req, res) {
export const createOrder = await attempt(async (req, res, next) => {
	await isValidUUID(req.body.data.users_id)
	// try {
	const result = await saveOrder(req.body.data)
	return await responseWithStatus(res, 1, 200, "Order created successfully", result)
	// } catch (err) {
	// 	return responseWithStatus(res, 0, 422, "An error occurred while creating the order", {
	// 		error_cause: !err.cause.name ? err.cause : err.cause.name,
	// 		error_message: err.message
	// 	})
	// }
})