import {
	getUserId as getUserIdAndAllDetails,
	isCredentialsMatching,
} from '../services/auth/authenticateUser.auth.service.js';
import { checkExistingEmail } from '../services/auth/checkExistingEmail.auth.service.js';
import registerUserToDatabase from '../services/auth/registerUser.auth.service.js';
import { confirmPassword } from '../utils/confirmPassword.js';
import { responseWithStatus } from '../utils/responses.js';
import envLogger from '../utils/customLogger.js';
import { createForgotPasswordEmail } from '../services/auth/createForgotPasswordEmail.auth.service.js';
import { verifyOTPFromDB } from '../services/auth/verifyOTP.auth.service.js';
import saveNewUserPasswordToDB from '../services/auth/saveNewPassword.auth.service.js';
import { signJwtAsync, verifyJwtAsync } from '../utils/jwtUtils.js';
import { attempt, BadRequestError, trialCapture } from '../utils/errors.js';
import { env, loadEnvFile } from 'node:process';
loadEnvFile();

export async function registerUser(req, res) {
	let request = Object.values(req.body.data);
	let userName = request[0];
	let userEmail = request[1];
	let userPassword = request[2];

	// --------------------------------------------------------------------------- //
	// Check if email exists in database already
	// --------------------------------------------------------------------------- //
	let existingEmailCheck = await checkExistingEmail(userEmail);

	if (existingEmailCheck == true) {
		return responseWithStatus(res, 0, 401, 'Error', 'Email already exists. Please sign in instead.');
	}
	// --------------------------------------------------------------------------- //
	// Save User details to Database if all checks are cleared
	// --------------------------------------------------------------------------- //
	const entryArray = [userName, userEmail, userPassword];
	try {
		const userRegistrationResult = await registerUserToDatabase(entryArray);
		const accessToken = await signJwtAsync({ id: userRegistrationResult.id }, env.ACCESS_TOKEN_SECRET_KEY, {
			expiresIn: `${Number(env.ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
		});
		const refreshToken = await signJwtAsync({ id: userRegistrationResult.id }, env.REFRESH_TOKEN_SECRET_KEY, {
			expiresIn: `${Number(env.REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
		});

		return await responseWithStatus(res, 1, 201, 'Sign Up successful!', {
			user_details: userRegistrationResult,
			access_token: accessToken,
			refresh_token: refreshToken,
		});
	} catch (error) {
		console.debug('Error creating record:', error, res);
	}
}

export async function loginUser(req, res) {
	let request = Object.values(req.body.data);
	let userEmail = request[0];
	let userPassword = request[1];

	try {
		// --------------------------------------------------------------------------- //
		// Check if email doesn't exist in database already
		// --------------------------------------------------------------------------- //
		let existingEmailCheck = await checkExistingEmail(userEmail);

		if (existingEmailCheck == false) {
			return await responseWithStatus(res, 0, 401, "Email doesn't exist. Please sign up instead");
		} else if (existingEmailCheck == true) {
			// --------------------------------------------------------------------------- //
			// Email and Password Combination Check
			// --------------------------------------------------------------------------- //
			let credentialMatchingResult = await isCredentialsMatching(userEmail, userPassword);

			if (credentialMatchingResult == true) {
				let userDetails = await getUserIdAndAllDetails(userEmail, userPassword);
				const accessToken = await signJwtAsync({ id: userDetails.id }, env.ACCESS_TOKEN_SECRET_KEY, {
					expiresIn: `${Number(env.ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
				});
				const refreshToken = await signJwtAsync({ id: userDetails.id }, env.REFRESH_TOKEN_SECRET_KEY, {
					expiresIn: `${Number(env.REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
				});

				return await responseWithStatus(res, 1, 200, 'Sign in successful!', {
					user_details: userDetails,
					access_token: `${accessToken}`,
					refresh_token: `${refreshToken}`,
				});
			} else {
				return await responseWithStatus(res, 0, 401, "Credentials Don't match. Please try again.", null);
			}
		}
	} catch (error) {
		console.debug('Error reading record:', error);
	}
}

export async function verifyUserToken(req, res) {
	if (!req.header('Authorization')) {
		return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please login.');
	} else {
		const token = req.header('Authorization').split(' ')[1];

		try {
			const verified = await verifyJwtAsync(token, env.ACCESS_TOKEN_SECRET_KEY);
			const userId = verified.id;
			return await responseWithStatus(res, 1, 200, 'Token Verified Successfully', { user_id: `${userId}` });
		} catch (err) {
			return await responseWithStatus(res, 0, 401, 'Invalid Token. Please login.', { error_info: `${err}` });
		}
	}
}

export async function refreshToken(req, res) {
	if (req.header('Authorization')) {
		const refreshToken = req.header('Authorization').split(' ')[1];
		// await verifyJwtAsync(refreshToken, env.REFRESH_TOKEN_SECRET_KEY, (err, decoded) => {
		const [token, err] = await trialCapture(await verifyJwtAsync(refreshToken, env.REFRESH_TOKEN_SECRET_KEY));
		if (err) {
			return responseWithStatus(res, 0, 401, 'Unauthorized. Invalid refresh token.', { error: err });
		} else {
			const accessToken = await signJwtAsync(
				{
					id: token.id,
				},
				env.ACCESS_TOKEN_SECRET_KEY,
				{
					expiresIn: `${Number(env.ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
				}
			);
			const refreshToken = await signJwtAsync(
				{
					id: token.id,
				},
				env.REFRESH_TOKEN_SECRET_KEY,
				{
					expiresIn: `${Number(env.REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
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

// async function verifyUserAccess(req, res) {
// 	const token = req.header('Authorization');
// 	if (!token) return res.status(401).send('Access Denied');

// 	try {
// 		const verified = jwt.verify(token, env.ACCESS_TOKEN_SECRET_KEY);
// 		const userId = verified.id;

// 		const isVerified = await verifyUserAccessFromDatabase(userId)

// 		if (isVerified == true) {
// 			return res.status(200).json([
// 				{
// 					type: 'success',
// 					message: 'Verified Token',
// 					is_verified: 'true',
// 				},
// 				{ user_id: userId },
// 				{ Authorization: token },
// 			]);
// 		} else {
// 			return res.status(200).json([
// 				{
// 					type: 'error',
// 					message: 'You have not verified your account. Please verify your account before trying again.',
// 					is_verified: 'false',
// 				},
// 				{ user_id: userId },
// 				{ Authorization: token },
// 			]);
// 		}
// 	} catch (err) {
// 		res.status(400).send('Invalid Token. Please login.' + err);
// 	}

// }

export async function forgotPassword(req, res) {
	const userEmail = Object.values(req.body.data).toString();

	try {
		const existingEmailCheck = await checkExistingEmail(userEmail);
		if (existingEmailCheck == false) {
			return responseWithStatus(res, 0, 401, "Email doesn't exist. Please sign up instead.");
		} else {
			const userId = await checkExistingEmail(userEmail, true);
			const sendEmailResult = await createForgotPasswordEmail(userId, userEmail);
			return responseWithStatus(
				res,
				1,
				200,
				'An OTP has been shared to your email address. Please use that to reset your password in the next screen.',
				sendEmailResult
			);
		}
	} catch (error) {
		console.log(error);
	}
}

export async function verifyOTP(req, res) {
	const userEmail = req.body.data.email;
	const userOTP = req.body.data.otp;

	const result = await verifyOTPFromDB(userEmail, userOTP);
	try {
		if (result === true) {
			const [tempToken, err] = await trialCapture(
				await signJwtAsync({ id: userEmail }, env.TEMPORARY_TOKEN_SECRET_KEY, {
					expiresIn: `${Number(env.TEMPORARY_TOKEN_EXPIRATION_TIME)}MINS`,
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

// export async function resetPassword(req, res) {
export const resetPassword = await attempt(async (req, res, next) => {
	if (!req.header('Authorization')) {
		return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please request another OTP.');
	} else {
		const token = req.header('Authorization').split(' ')[1];
		// try {
		const userEmail = req.body.data.email;
		const userPassword = req.body.data.password;
		const userConfirmedPassword = req.body.data.confirmed_password;

		const [tempTokenResult, tempTokenError] = await trialCapture(
			await verifyJwtAsync(token, env.TEMPORARY_TOKEN_SECRET_KEY)
		);
		if (tempTokenResult.id !== userEmail) {
			throw new BadRequestError('Nice try lol');
		}
		if (tempTokenError) {
			throw new Error(tempTokenError.message, { cause: tempTokenError });
		}

		let confirmPasswordCheck = confirmPassword(userPassword, userConfirmedPassword);

		if (confirmPasswordCheck == false) {
			return responseWithStatus(res, 0, 400, 'Error', "Passwords don't match. Please try again instead");
		}

		// try {
		const [userRegistrationResult, userRegistrationError] = await trialCapture(
			await saveNewUserPasswordToDB(userEmail, userPassword)
		);
		if (userRegistrationError) {
			return BadRequestError('Request failed, Email must be faulty');
		}

		const accessToken = await signJwtAsync({ id: userRegistrationResult.id }, env.ACCESS_TOKEN_SECRET_KEY, {
			expiresIn: `${Number(env.ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
		});
		const refreshToken = await signJwtAsync({ id: userRegistrationResult.id }, env.REFRESH_TOKEN_SECRET_KEY, {
			expiresIn: `${Number(env.REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
		});
		return await responseWithStatus(res, 1, 201, 'Password Reset successful!', {
			user_details: userRegistrationResult,
			access_token: accessToken,
			refresh_token: refreshToken,
		});
		// } catch (err) {
		// 	await envLogger('Error creating record', err, res);
		// }
		// } catch (err) {
		// 	return await responseWithStatus(
		// 		res,
		// 		0,
		// 		401,
		// 		'Error in verifying the temporary token. Please request another OTP.',
		// 		{ error_info: err }
		// 	);
		// }
	}
});
