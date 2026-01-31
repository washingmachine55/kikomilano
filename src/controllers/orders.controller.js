import { env, loadEnvFile } from 'node:process';
import { responseWithStatus } from '../utils/RESPONSES.js';
import { saveOrder } from '../services/orders/orders.service.js';
import { isValidUUID } from '../utils/validateUUID.js';
import { ValidationError } from '../utils/errors.js';
loadEnvFile();

export async function createOrder(req, res) {
	await isValidUUID(req.body.data.users_id)

	const result = await saveOrder(req.body.data)
	return responseWithStatus(res, 1, 200, "Order created successfully", result)
}