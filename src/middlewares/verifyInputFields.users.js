import z from 'zod';
import { authForgotPasswordSchema, authLoginSchema, authRegisterSchema, authResetPasswordSchema, authVerifyOTPSchema, userFavoriteProductSchema, UUIDSchema } from '../utils/schema.validations.js';
import { responseWithStatus } from '../utils/responses.js';

export async function verifyInputFields(req, res, next) {
	let reqData;
	switch (req.path) {
		case "/set-favorites":
			reqData = await userFavoriteProductSchema.safeParseAsync(req.body.data);
			break;
		default:
			break;
	}

/* 	if (req.path == '/register') {
		reqData = await authRegisterSchema.safeParseAsync(req.body.data);
	} else if (req.path == '/forgot-password') {
		reqData = await authForgotPasswordSchema.safeParseAsync(req.body.data);
	} else if (req.path == '/verify-otp') {
		reqData = await authVerifyOTPSchema.safeParseAsync(req.body.data);
	} else if (req.path == '/reset-password') {
		reqData = await authResetPasswordSchema.safeParseAsync(req.body.data);
	} else {
		reqData = await authLoginSchema.safeParseAsync(req.body.data);
	} */

	if (!reqData.success) {
		return await responseWithStatus(res, 0, 400, 'Validation Error. Please try again.', {
			errors: z.flattenError(reqData.error).fieldErrors,
		});
	} else {
		next();
	}
}
