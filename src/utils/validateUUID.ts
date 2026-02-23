import { UnprocessableContentError } from './errors.ts';
import { UUIDSchema } from './schema.validations.ts';

export async function isValidUUID(inputToValidate: string) {
	const validationResult = await UUIDSchema.safeParseAsync(inputToValidate);
	if (!validationResult.success) {
		throw new UnprocessableContentError('Invalid UUID');
	}
	return validationResult.success;
}
