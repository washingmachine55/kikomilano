import { responseWithStatus } from '../utils/responses.js';
import z from 'zod';
import { authRegisterSchema, authResetPasswordSchema, authVerifyOTPSchema, ordersNewJsonSchema, userProfileEditJsonSchema, authLoginSchema, emailSchema, userFavoriteProductSchema } from '../utils/schema.validations.js';


export const globallyVerifyInputFields = async (req, res, next) => {
	let reqData;
	const successTrial = async () => {
		if (!reqData.success) {
			return await responseWithStatus(res, 0, 400, 'Validation Error. Please try again.', {
				errors: z.flattenError(reqData.error).fieldErrors,
				paths: reqData.error.issues[0].path
			});
		} else {
			next();
		}
	}
	
	switch (req.path) {
		case "/auth/register":
			reqData = await authRegisterSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		case "/auth/login":
			reqData = await authLoginSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		case "/auth/forgot-password":
			reqData = await emailSchema.safeParseAsync(req.body.data.email);
			await successTrial();
			break;
		case "/auth/verify-otp":
			reqData = await authVerifyOTPSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		case "/auth/reset-password":
			reqData = await authResetPasswordSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		case "/users/profile/edit":
			reqData = await userProfileEditJsonSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		// case "/users/profile-picture-upload":
		// 	reqData = await authVerifyOTPSchema.safeParseAsync(req.body.data);
		// 	await successTrial();
		// 	break;
		case "/users/set-favorites":
			reqData = await userFavoriteProductSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		case "/users/remove-favorites":
			reqData = await userFavoriteProductSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		case "/orders":
			reqData = await ordersNewJsonSchema.safeParseAsync(req.body.data);
			await successTrial();
			break;
		default:
			next()
			break;
	}
}
