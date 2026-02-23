import { UnprocessableContentError } from './errors';
import { UUIDSchema } from './schema.validations';

export async function isValidUUID(inputToValidate: string) {
	const validationResult = await UUIDSchema.safeParseAsync(inputToValidate);
	if (!validationResult.success) {
		throw new UnprocessableContentError('Invalid UUID');
	}
	return validationResult.success;
}
