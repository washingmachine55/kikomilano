import z from 'zod';
import { authForgotPasswordSchema, authLoginSchema, authRegisterSchema, authResetPasswordSchema, authVerifyOTPSchema, nameSchema, PasswordChangeSchema, userFavoriteProductSchema, UUIDSchema } from '../utils/schema.validations.js';
import { responseWithStatus } from '../utils/responses.js';

export async function verifyInputFields(req, res, next) {
	let reqData;

	const successTrial = async () => {
		if (!reqData.success) {
			return await responseWithStatus(res, 0, 400, 'Validation Error. Please try again.', {
				errors: z.flattenError(reqData.error).fieldErrors,
			});
		} else {
			next();
		}
	}

	switch (req.path) {
		case "/set-favorites":
			reqData = await userFavoriteProductSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		case "/profile/edit":
			if (Object.values(req.body.data).length >= 1) {
				if (Object.hasOwn(req.body.data, "email")) {
					reqData = await authForgotPasswordSchema.safeParseAsync(req.body.data);
				}
				if (Object.hasOwn(req.body.data, "name")) {
					reqData = await nameSchema.safeParseAsync(req.body.data);
				}
				if (Object.hasOwn(req.body.data, "password")) {
					reqData = await PasswordChangeSchema.safeParseAsync(req.body.data);
				}
				await successTrial();
				break;
			}

			if (Object.values(req.body.data).length == 0) {
				next()
			}

			break;
		default:
			break;
	}

}
