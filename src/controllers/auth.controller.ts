import {
	getUserId as getUserIdAndAllDetails,
	isCredentialsMatching,
} from '../services/auth/authenticateUser.auth.service.ts';
import { checkExistingEmail_v2 } from '../services/auth/checkExistingEmail.auth.service.ts';
import registerUserToDatabase from '../services/auth/registerUser.auth.service.ts';
import { responseWithStatus } from '../utils/responses.ts';
import { createForgotPasswordEmail } from '../services/auth/createForgotPasswordEmail.auth.service.ts';
import { verifyOTPFromDB } from '../services/auth/verifyOTP.auth.service.ts';
import saveNewUserPasswordToDB from '../services/auth/saveNewPassword.auth.service.ts';
import { signJwtAsync, verifyJwtAsync } from '../utils/jwtUtils.ts';
import { attempt, BadRequestError, ForbiddenError, trialCapture, UnauthorizedError } from '../utils/errors.ts';
import type { NextFunction, Request, Response } from 'express';
import { 
	ACCESS_TOKEN_SECRET_KEY,
	ACCESS_TOKEN_EXPIRATION_TIME,
	REFRESH_TOKEN_SECRET_KEY,
	REFRESH_TOKEN_EXPIRATION_TIME,
	TEMPORARY_TOKEN_SECRET_KEY,
	TEMPORARY_TOKEN_EXPIRATION_TIME 
} from '../config/env-config.ts';

export const registerUser = await attempt(async (req: Request, res: Response, next: NextFunction) => {
	const request = Object.values(req.body.data);
	const userName = request[0];
	const userEmail = request[1];
	const userPassword = request[2];

	// --------------------------------------------------------------------------- //
	// Check if email exists in database already
	// --------------------------------------------------------------------------- //
	const existingEmailCheck = await checkExistingEmail_v2(userEmail);
	if (existingEmailCheck === true) {
		throw new ForbiddenError('Cant register user as user email already exists. Please sign in instead', "unable to wables");
	} else {
		// --------------------------------------------------------------------------- //
		// Save User details to Database if all checks are cleared
		// --------------------------------------------------------------------------- //
		const entryArray = [userName, userEmail, userPassword];
		const userRegistrationResult = await registerUserToDatabase(entryArray);
		const accessToken = await signJwtAsync({ id: userRegistrationResult.id }, ACCESS_TOKEN_SECRET_KEY, {
			expiresIn: `${Number(ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
		});
		const refreshToken = await signJwtAsync({ id: userRegistrationResult.id }, REFRESH_TOKEN_SECRET_KEY, {
			expiresIn: `${Number(REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
		});

		return await responseWithStatus(res, 1, 201, 'Sign Up successful!', {
			user_details: userRegistrationResult,
			access_token: accessToken,
			refresh_token: refreshToken,
		});
	}
});

export const loginUser = await attempt(async (req: Request, res: Response,) => {
	const userEmail = req.body.data.email;
	const userPassword = req.body.data.password;
	// --------------------------------------------------------------------------- //
	// Check if email doesn't exist in database already
	// --------------------------------------------------------------------------- //
	const existingEmailCheck = await checkExistingEmail_v2(userEmail);
	if (existingEmailCheck === true) {
		// --------------------------------------------------------------------------- //
		// Email and Password Combination Check
		// --------------------------------------------------------------------------- //
		const credentialMatchingResult = await isCredentialsMatching(userEmail, userPassword);
		if (credentialMatchingResult == true) {
			const userDetails = await getUserIdAndAllDetails(userEmail, userPassword);
			const accessToken = await signJwtAsync({ id: userDetails.id }, ACCESS_TOKEN_SECRET_KEY, {
				expiresIn: `${Number(ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
			});
			const refreshToken = await signJwtAsync({ id: userDetails.id }, REFRESH_TOKEN_SECRET_KEY, {
				expiresIn: `${Number(REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
			});

			return await responseWithStatus(res, 1, 200, 'Sign in successful!', {
				user_details: userDetails,
				access_token: accessToken,
				refresh_token: refreshToken,
			});
		} else {
			throw new UnauthorizedError("Credentials Don't match. Please try again.");
		}
	} else {
		throw new UnauthorizedError("Email doesn't exist. Please sign up instead.");
	}
});

export async function verifyUserToken(req: Request, res: Response) {
	if (!req.header('Authorization')) {
		return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please login.');
	} else {
		const token: string = req.header('Authorization')!.split(' ')[1];
		try {
			const verified: Promise<Function> = await verifyJwtAsync(token, ACCESS_TOKEN_SECRET_KEY);
			const userId = verified.id;
			return await responseWithStatus(res, 1, 200, 'Token Verified Successfully', { user_id: `${userId}` });
		} catch (err) {
			return await responseWithStatus(res, 0, 401, 'Invalid Token. Please login.', { error_info: `${err}` });
		}
	}
}

export async function refreshToken(req: Request, res: Response,) {
	if (req.header('Authorization')) {
		const refreshToken: string | undefined = req.header('Authorization')!.split(' ')[1];
		// await verifyJwtAsync(refreshToken, REFRESH_TOKEN_SECRET_KEY, (err, decoded) => {
		const [token, err] = await trialCapture(await verifyJwtAsync(refreshToken, REFRESH_TOKEN_SECRET_KEY));
		if (err) {
			// return responseWithStatus(res, 0, 401, 'Unauthorized. Invalid refresh token.', { error: err });
			return responseWithStatus(res, 0, 401, 'Unauthorized. Invalid refresh token.');
		} else {
			const accessToken = await signJwtAsync(
				{
					id: token.id,
				},
				ACCESS_TOKEN_SECRET_KEY,
				{
					expiresIn: `${Number(ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
				}
			);
			const refreshToken = await signJwtAsync(
				{
					id: token.id,
				},
				REFRESH_TOKEN_SECRET_KEY,
				{
					expiresIn: `${Number(REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
				}
			);
			return responseWithStatus(res, 1, 201, 'Tokens refreshed successfully', {
				access_token: accessToken,
				refresh_token: refreshToken,
			});
		}
	} else {
		return responseWithStatus(res, 0, 401, 'Unauthorized. Invalid token.');
	}
}

export const forgotPassword = await attempt(async (req: Request, res: Response,) => {
	const userEmail = Object.values(req.body.data).toString();

	const existingEmailCheck = await checkExistingEmail_v2(userEmail);
	if (existingEmailCheck === false) {
		throw new UnauthorizedError("Email doesn't exist. Please sign up instead.");
	} else {
		await createForgotPasswordEmail(userEmail);
		return responseWithStatus(
			res,
			1,
			200,
			'An OTP has been shared to your email address. Please use that to reset your password in the next screen.'
		);
	}
});

export async function verifyOTP(req: Request, res: Response,) {
	const userEmail = req.body.data.email;
	const userOTP = req.body.data.otp;

	const result = await verifyOTPFromDB(userEmail, userOTP);
	try {
		if (result === true) {
			const [tempToken, err] = await trialCapture(
				await signJwtAsync({ id: userEmail }, TEMPORARY_TOKEN_SECRET_KEY, {
					expiresIn: `${Number(TEMPORARY_TOKEN_EXPIRATION_TIME)}MINS`,
				})
			);
			if (err) {
				return responseWithStatus(res, 1, 500, 'Error occurred in creating a temporary token', err);
			} else {
				return responseWithStatus(res, 1, 200, 'OTP has been verified!', {
					temporary_token: tempToken,
					expires_in: '10 Minutes',
				});
			}
		} else {
			return responseWithStatus(res, 1, 401, 'Invalid OTP or email does not exist');
		}
	} catch (error) {
		console.log(error);
	}
}

export const resetPassword = await attempt(async (req: Request, res: Response) => {
	if (!req.header('Authorization')) {
		return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please request another OTP.');
	} else {
		const token = req.header('Authorization').split(' ')[1];
		const userEmail = req.body.data.email;
		const userPassword = req.body.data.password;

		const [tempTokenResult, tempTokenError] = await trialCapture(
			await verifyJwtAsync(token, TEMPORARY_TOKEN_SECRET_KEY)
		);
		if (tempTokenResult.id !== userEmail) {
			throw new BadRequestError('Nice try lol');
		}
		if (tempTokenError) {
			throw new Error(tempTokenError.message, { cause: tempTokenError });
		}

		const [userRegistrationResult, userRegistrationError] = await trialCapture(
			await saveNewUserPasswordToDB(userEmail, userPassword)
		);
		if (userRegistrationError) {
			throw new BadRequestError('Request failed, Email must be faulty');
		}

		const accessToken = await signJwtAsync({ id: userRegistrationResult.id }, ACCESS_TOKEN_SECRET_KEY, {
			expiresIn: `${Number(ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
		});
		const refreshToken = await signJwtAsync({ id: userRegistrationResult.id }, REFRESH_TOKEN_SECRET_KEY, {
			expiresIn: `${Number(REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
		});
		return await responseWithStatus(res, 1, 201, 'Password Reset successful!', {
			user_details: userRegistrationResult,
			access_token: accessToken,
			refresh_token: refreshToken,
		});
	}
});
