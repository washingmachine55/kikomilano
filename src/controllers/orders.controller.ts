import { responseWithStatus } from '../utils/responses.js';
import { saveOrder } from '../services/orders/orders.service.js';
import { isValidUUID } from '../utils/validateUUID.js';
import { attempt } from '../utils/errors.js';
import type { NextFunction, Response, Request } from 'express';

export const createOrder = attempt(async (req: Request, res: Response, _next: NextFunction) => {
	await isValidUUID(req.user!['id']);
	const result = await saveOrder(req.body.data, req.user!['id']);
	await responseWithStatus(res, 1, 200, 'Order created successfully', result);
});
