import { env, loadEnvFile } from 'node:process';
import { responseWithStatus } from '../utils/responses.js';
import { saveOrder } from '../services/orders/orders.service.js';
import { isValidUUID } from '../utils/validateUUID.js';
import { attempt, ValidationError } from '../utils/errors.js';
loadEnvFile();

export const createOrder = await attempt(async (req, res, next) => {
	await isValidUUID(req.user.id);
	const result = await saveOrder(req.body.data, req.user.id);
	return await responseWithStatus(res, 1, 200, 'Order created successfully', result);
});
