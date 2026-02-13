import z from 'zod';
import { UnprocessableContentError } from './errors.js';
import { UUIDSchema } from './schema.validations.js';

export async function isValidUUID(inputToValidate) {
	const validationResult = await UUIDSchema.safeParseAsync(inputToValidate);
	if (!validationResult.success) {
		throw new UnprocessableContentError('Invalid UUID');
	}
	return validationResult.success;
}
