import z from "zod";
import { authLoginSchema, authRegisterSchema } from "../utils/schema.validations.js";

export async function verifyInputFields(req, res, next) {

	let reqData;
	if (req.path == '/register') {
		reqData = await authRegisterSchema.safeParseAsync(req.body.data);
	} else {
		reqData = await authLoginSchema.safeParseAsync(req.body.data);
	}

	if (!reqData.success) {
		return res.status(200).json([
			{
				type: 'validation_error',
				body: z.flattenError(reqData.error).fieldErrors,
				// message: reqData.error.issues.message.toString(),
				// path: reqData.error.issues.path,
			},
		]);
	} else {
		next()
	}
}