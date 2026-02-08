import z from 'zod';
import { ValidationError } from './errors.js';
import { UUIDSchema } from './schema.validations.js';

export async function isValidUUID(inputToValidate) {
	const validationResult = await UUIDSchema.safeParseAsync(inputToValidate);
	if (!validationResult.success) {
		throw new ValidationError('Invalid UUID');
	}
	return validationResult.success;
}
