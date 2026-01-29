import z from "zod";
import { UUIDSchema } from "../utils/schema.validations.js";
import { responseWithStatus } from "../utils/RESPONSES.js";

export async function validateUuidUrlParam(req, res, next) {
	const inputToValidate = req.params.productId.toLowerCase();
	const validationResult = await UUIDSchema.safeParseAsync(inputToValidate)

	if (!validationResult.success) {
		return await responseWithStatus(res, 0, 400, 'Validation Error. Please try again.', {
			errors: z.flattenError(validationResult.error).formErrors,
		});
	} else {
		next();
	}
}
