import {
	getUserId as getUserIdAndAllDetails,
	isCredentialsMatching,
} from '../services/auth/authenticateUser.auth.service.js';
import { checkExistingEmail } from '../services/auth/checkExistingEmail.auth.service.js';
import registerUserToDatabase from '../services/auth/registerUser.auth.service.js';
import { confirmPassword } from '../utils/confirmPassword.js';

import jwt from 'jsonwebtoken';
// import verifyUserAccessFromDatabase from '../services/verifyUserAccessDatabaseService.js';
// import { formatDate, formatDistance } from 'date-fns';
// import { TZDate } from '@date-fns/tz';
import { env, loadEnvFile } from 'node:process';
loadEnvFile();
import { responseWithStatus } from '../utils/RESPONSES.js';
import { EMAIL_EXISTS_ALREADY, MISSING_INPUT_FIELDS, PASSWORDS_DONT_MATCH } from '../utils/CONSTANTS.js';
import envLogger from '../utils/customLogger.js';
import { createForgotPasswordEmail } from '../services/auth/createForgotPasswordEmail.auth.service.js';
import { verifyOTPFromDB } from '../services/auth/verifyOTP.auth.service.js';
import saveNewUserPasswordToDB from '../services/auth/saveNewPassword.auth.service.js';
import { signJwtAsync, verifyJwtAsync } from '../utils/jwtUtils.js';

// import { OAuth2Client } from 'google-auth-library';
// export async function googleAuth(req, res) {
// 	try {
// 		const client = new OAuth2Client();
// 		const ticket = await client.verifyIdToken({
// 			idToken: token,
// 			audience: WEB_CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
// 			// Or, if multiple clients access the backend:
// 			//[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
// 		});
// 		const payload = ticket.getPayload();
// 		// This ID is unique to each Google Account, making it suitable for use as a primary key
// 		// during account lookup. Email is not a good choice because it can be changed by the user.
// 		const userid = payload['sub'];
// 		// If the request specified a Google Workspace domain:
// 		// const domain = payload['hd'];

// 		console.log(userid);
// 		console.log(payload)

// 	} catch (error) {
// 		console.log(error);
// 	}
// }

export async function registerUser(req, res) {
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to register their account for the first time.'
	// #swagger.description = 'This endpoint would only be used once to register a new user'
	// #swagger.security = []
	/*  #swagger.requestBody = {
			required: true,
			schema: { $ref: "#/components/schemas/registerSchema" }  
		} 
	*/
	/* #swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				example: {
					data: {
						name: 'John Doe',
						email: 'example@example.com',
						password: 'secret_password',
						confirmed_password: 'secret_password'
					}
				}
			}
		}
	}
	*/

	/*  #swagger.parameters['body'] = {
		in: 'body',
		description: 'Some description...',
		required: true,
		schema: {
			data: {
				$name: 'John Doe',
				email: 'example@example.com',
				password: 'secret_password',
				confirmed_password: 'secret_password'
			}
		}
	} */

	let request = Object.values(req.body.data);
	let userName = request[0];
	let userEmail = request[1];
	let userPassword = request[2];
	let userConfirmedPassword = request[3];

	// if (userName == null || userEmail == null || userPassword == null || userConfirmedPassword == null) {
	// 	// #swagger.responses[400] = { description: 'One or more input fields are empty. Please fill up all the input fields before submitting.' }
	// 	return responseWithStatus(res, 0, 400, 'One or more input fields are empty. Please fill up all the input fields before submitting.');
	// } else {
		// --------------------------------------------------------------------------- //
		// Check if email exists in database already
		// --------------------------------------------------------------------------- //
		let existingEmailCheck = await checkExistingEmail(userEmail);

		if (existingEmailCheck == true) {
			// #swagger.responses[401] = { description: 'Email already exists. Please sign in instead.' }
			return responseWithStatus(res, 0, 401, 'Error', 'Email already exists. Please sign in instead.');
		}
		// --------------------------------------------------------------------------- //
		// Password Confirmation Check
		// --------------------------------------------------------------------------- //
	// let confirmPasswordCheck = confirmPassword(userPassword, userConfirmedPassword);

	// if (confirmPasswordCheck == false) {
	// 	// #swagger.responses[400] = { description: "Passwords don't match. Please try again instead." }
	// 	return responseWithStatus(res, 0, 400, 'Error', "Passwords don't match. Please try again instead.");
	// }

		// --------------------------------------------------------------------------- //
		// Save User details to Database if all checks are cleared
		// --------------------------------------------------------------------------- //
		const entryArray = [userName, userEmail, userPassword];
		try {
			const userRegistrationResult = await registerUserToDatabase(entryArray);
			const accessToken = jwt.sign({ id: userRegistrationResult.id }, env.ACCESS_TOKEN_SECRET_KEY, {
				expiresIn: `${Number(env.ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
			});
			const refreshToken = jwt.sign({ id: userRegistrationResult.id }, env.REFRESH_TOKEN_SECRET_KEY, {
				expiresIn: `${Number(env.REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
			});

			/* #swagger.responses[201] = {
				description: 'Sign Up successful!',
				content: {
					"application/json": {
						example: {
							"status": 201,
							"type": 1,
							"message": "Sign Up successful!",
							"data": {
								"user_details": {
									"id": "019c0a0c-6a5c-7c53-9686-4f155b77123b",
									"email": "sample@user.com",
									"access_type": 0,
									"created_at": "2026-01-29T13:58:31.772Z",
									"first_name": "Sample",
									"last_name": "User",
									"images_id": null
								},
							"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOWMwYTBjLTZhNWMtN2M1My05Njg2LTRmMTU1Yjc3MTIzYiIsImlhdCI6MTc2OTY5NTExMSwiZXhwIjoxNzY5Njk4NzExfQ.E5wRmBg1YrUBqIA9qGdnqN0XsDh6T02qScSd-8-DweQ",
							"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOWMwYTBjLTZhNWMtN2M1My05Njg2LTRmMTU1Yjc3MTIzYiIsImlhdCI6MTc2OTY5NTExMSwiZXhwIjoxNzcwMjk5OTExfQ.visdlLXjLsPJHL4xCFR6ikBgbTuBtvJ1MyrkGqksrO8"
							}
						}
					}           
				}
			} 
			*/

			return await responseWithStatus(res, 1, 201, 'Sign Up successful!', {
				user_details: userRegistrationResult,
				access_token: accessToken,
				refresh_token: refreshToken,
			});
		} catch (error) {
			console.debug('Error creating record:', error, res);
		}
	// }
}

export async function loginUser(req, res) {
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to login'
	// #swagger.description = 'Used for to normally log in a user that is unauthenticated.'
	// #swagger.security = []
	/*  #swagger.requestBody = {
		required: true,
		schema: { $ref: "#/components/schemas/loginSchema" }  
	} 
	*/

	/*  #swagger.parameters['body'] = {
	in: 'body',
	description: 'Some description...',
	required: true,
	schema: {
		data: {
			$email: 'example@example.com',
			$password: 'secret_password',
		}
	}
} */

	let request = Object.values(req.body.data);
	let userEmail = request[0];
	let userPassword = request[1];

	try {
		// --------------------------------------------------------------------------- //
		// Check if email doesn't exist in database already
		// --------------------------------------------------------------------------- //
		let existingEmailCheck = await checkExistingEmail(userEmail);

		if (existingEmailCheck == false) {
			// #swagger.responses[401] = { description: "Email doesn't exist. Please sign up instead" }
			return await responseWithStatus(res, 0, 401, "Email doesn't exist. Please sign up instead");
		} else if (existingEmailCheck == true) {
			// --------------------------------------------------------------------------- //
			// Email and Password Combination Check
			// --------------------------------------------------------------------------- //
			let credentialMatchingResult = await isCredentialsMatching(userEmail, userPassword);

			if (credentialMatchingResult == true) {
				let userDetails = await getUserIdAndAllDetails(userEmail, userPassword);
				const accessToken = jwt.sign({ id: userDetails.id }, env.ACCESS_TOKEN_SECRET_KEY, {
					expiresIn: `${Number(env.ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
				});
				const refreshToken = jwt.sign({ id: userDetails.id }, env.REFRESH_TOKEN_SECRET_KEY, {
					expiresIn: `${Number(env.REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
				});

				// #swagger.responses[200] = { description: 'Sign in successful!' }
				return await responseWithStatus(res, 1, 200, 'Sign in successful!', {
					user_details: userDetails,
					access_token: `${accessToken}`,
					refresh_token: `${refreshToken}`,
				});
			} else {
				// #swagger.responses[401] = { description: "Credentials Don't match. Please try again." }
				return await responseWithStatus(res, 0, 401, "Credentials Don't match. Please try again.", null);
			}
		}
	} catch (error) {
		console.debug('Error reading record:', error);
	}
}

// async function logoutUser(req, res) {
// 	const token = req.header('authorization');
// 	try {
// 		const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET_KEY);
// 		const userId = decoded.id;
// 		res.status(200).json({
// 			type: 'success',
// 			message: `${userId} has been Logged out successfully`,
// 		});
// 		// next();
// 	} catch (err) {
// 		res.status(401).json({ msg: 'Token is not valid', error: err });
// 	}
// }

export async function verifyUserToken(req, res) {
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to verify Bearer token. This is different from middleware confirmation.'
	// #swagger.description = 'Use this if you want to verify authorization for access to something, or want to get the User's ID for fetching'
	// #swagger.security = []


	if (!req.header('Authorization')) {
		// #swagger.responses[401] = { description: 'Unauthorized. Access Denied. Please login.' }
		return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please login.');
	} else {
		const token = req.header('Authorization').split(' ')[1];
		// if (!token) return res.status(401).send('Access Denied');

		try {
			const verified = jwt.verify(token, env.ACCESS_TOKEN_SECRET_KEY);
			const userId = verified.id;
			// #swagger.responses[200] = { description: 'Token Verified Successfully.' }
			return await responseWithStatus(res, 1, 200, 'Token Verified Successfully', { user_id: `${userId}` });
		} catch (err) {
			// #swagger.responses[401] = { description: 'Invalid Token. Please login.' }
			return await responseWithStatus(res, 0, 401, 'Invalid Token. Please login.', { error_info: `${err}` });
		}
	}
}

export async function refreshToken(req, res) {
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to renew access and refresh tokens.'
	// #swagger.description = "Use this in automation as once you detect a status code in the 400 range, you'll need to automatically hit this API. Make sure to pass the refresh token instead to get new access and refresh tokens."
	// #swagger.security = []


	if (req.header('Authorization')) {
		const refreshToken = req.header('Authorization').split(' ')[1];
		jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET_KEY, (err, decoded) => {
			if (err) {
				// #swagger.responses[401] = { description: 'Unauthorized. Invalid refresh token.' }
				return responseWithStatus(res, 0, 401, 'Unauthorized. Invalid refresh token.', { error: err });
			} else {
				const accessToken = jwt.sign(
					{
						id: decoded.id,
					},
					env.ACCESS_TOKEN_SECRET_KEY,
					{
						expiresIn: `${Number(env.ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
					}
				);
				const refreshToken = jwt.sign(
					{
						id: decoded.id,
					},
					env.REFRESH_TOKEN_SECRET_KEY,
					{
						expiresIn: `${Number(env.REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
					}
				);
				// #swagger.responses[201] = { description: 'Tokens refreshed successfully.' }
				return responseWithStatus(res, 1, 201, 'Tokens refreshed successfully', {
					access_token: accessToken,
					refresh_token: refreshToken,
				});
			}
		});
	} else {
		// #swagger.responses[401] = { description: 'Unauthorized. Invalid token.' }
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
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to send a forgot password request'
	// #swagger.description = 'Used for starting a chain to reset a forgotten password.'
	/* #swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				example: {
					data: {
						email: 'example@example.com',
					}
				}
			}
		}
	}
	*/

	/*  #swagger.parameters['body'] = {
		in: 'body',
		required: true,
		schema: {
			data: {
				$email: 'example@example.com',
			}
		}
	} */

	const userEmail = Object.values(req.body.data).toString();

	try {
		const existingEmailCheck = await checkExistingEmail(userEmail)
		if (existingEmailCheck == false) {
			// #swagger.responses[401] = { description: "Email doesn't exist. Please sign up instead." }
			return responseWithStatus(res, 0, 401, "Email doesn't exist. Please sign up instead.")
		} else {
			const userId = await checkExistingEmail(userEmail, true)
			const sendEmailResult = await createForgotPasswordEmail(userId, userEmail)
			// #swagger.responses[200] = { description: 'An OTP has been shared to your email address. Please use that to reset your password in the next screen.' }
			return responseWithStatus(res, 1, 200, "An OTP has been shared to your email address. Please use that to reset your password in the next screen.")
		}
	} catch (error) {
		console.log(error);
	}
}

export async function verifyOTP(req, res) {
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to verify their OTP'
	// #swagger.description = 'Used for verifying the OTP. Provides a temporary token that needs to be used in /reset-password endpoint'
	/* #swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				example: {
					"data": {
						"email": "ahmed@admin.com",
						"otp": "882724"
					}
				}
			}
		}
	}
	*/

	/*  #swagger.parameters['body'] = {
		in: 'body',
		required: true,
		schema: {
			data: {
				$email: 'example@example.com',
				$otp: '882724',
			}
		}
	} */

	const userEmail = req.body.data.email
	const userOTP = req.body.data.otp

	const result = await verifyOTPFromDB(userEmail, userOTP)
	try {
		if (result === true) {
			jwt.sign({ id: userEmail }, env.TEMPORARY_TOKEN_SECRET_KEY, { expiresIn: `${Number(env.TEMPORARY_TOKEN_EXPIRATION_TIME)}MINS` }, (err, tempToken) => {
				if (err) {
					return responseWithStatus(res, 1, 500, "Error occurred in creating a temporary token", err)
				} else {
					// #swagger.responses[200] = { description: 'OTP has been verified!' }
					return responseWithStatus(res, 1, 200, "OTP has been verified!", { temporary_token: tempToken, expires_in: '10 Minutes' })
				}
			});
		} else {
			// #swagger.responses[401] = { description: 'Invalid OTP or email does not exist.' }
			return responseWithStatus(res, 1, 401, "Invalid OTP or email does not exist")
		}
	} catch (error) {
		console.log(error);
	}
}

export async function resetPassword(req, res) {
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to Reset their password'
	// #swagger.description = 'Used for resetting the user's password using the temporary token that was obtained in the /verify-otp endpoint'

	/* #swagger.parameters['Authorization'] = {
		in: 'header',                            
		required: true,                     
		type: 'string',
		schema: {
			"Authorization": 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFobWVkQGFkbWluLmNvbSIsImlhdCI6MTc2OTYxMDY3NywiZXhwIjoxNzY5NjExMjc3fQ.rotqukJWBhZenFtx0q9LaKH9SkbAOiVaw-6DOP2IP9k'
		}                        
	} */

	/* #swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
					example: {
						"data": {
							"email": "ahmed@admin.com",
							"password": "password123",
							"confirmed_password": "password123"
						}
					}
				}
			}
		}
	}
	*/

	/*  #swagger.parameters['body'] = {
		in: 'body',
		required: true,
		schema: {
				"data": {
					"email": "ahmed@admin.com",
					"password": "password123",
					"confirmed_password": "password123"
				}
			}
		}
	} */

	if (!req.header('Authorization')) {
		// #swagger.responses[401] = { description: 'Unauthorized. Access Denied. Please request another OTP.' }
		return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please request another OTP.');
	} else {
		const token = req.header('Authorization').split(' ')[1];
		try {
			await verifyJwtAsync(token, env.TEMPORARY_TOKEN_SECRET_KEY)

			const userEmail = req.body.data.email
			const userPassword = req.body.data.password
			const userConfirmedPassword = req.body.data.confirmed_password

			let confirmPasswordCheck = confirmPassword(userPassword, userConfirmedPassword);

			if (confirmPasswordCheck == false) {
				// #swagger.responses[400] = { description: "Passwords don't match. Please try again instead." }
				return responseWithStatus(res, 0, 400, 'Error', "Passwords don't match. Please try again instead");
			}

			try {
				const userRegistrationResult = await saveNewUserPasswordToDB(userEmail, userPassword);
				const accessToken = await signJwtAsync({ id: userRegistrationResult.id }, env.ACCESS_TOKEN_SECRET_KEY, {
					expiresIn: `${Number(env.ACCESS_TOKEN_EXPIRATION_TIME)}MINS`,
				});
				const refreshToken = await signJwtAsync({ id: userRegistrationResult.id }, env.REFRESH_TOKEN_SECRET_KEY, {
					expiresIn: `${Number(env.REFRESH_TOKEN_EXPIRATION_TIME)}MINS`,
				});

				// #swagger.responses[201] = { description: 'Password Reset successful!' }
				return await responseWithStatus(res, 1, 201, 'Password Reset successful!', {
					user_details: userRegistrationResult,
					access_token: accessToken,
					refresh_token: refreshToken,
				});
			} catch (err) {
				await envLogger('Error creating record', err, res);
			}
		} catch (err) {
			// #swagger.responses[401] = { description: 'Invalid Token. Please request another OTP.' }
			return await responseWithStatus(res, 0, 401, 'Error in verifying the temporary token. Please request another OTP.', { error_info: err });
		}
	}
}
