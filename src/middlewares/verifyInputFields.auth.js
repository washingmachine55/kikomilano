import z from "zod";
import {authRegisterSchema} from "../utils/schema.validations.js";

export async function verifyInputFields(req, res, next) {

	const reqData = await authRegisterSchema.safeParseAsync(req.body.data);

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