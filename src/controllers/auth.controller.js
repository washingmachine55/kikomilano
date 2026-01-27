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
// import console.debug from '../utils/customLogger.js';

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

	if (userName == null || userEmail == null || userPassword == null || userConfirmedPassword == null) {
		return responseWithStatus(res, 0, 400, MISSING_INPUT_FIELDS);
	} else {
		// --------------------------------------------------------------------------- //
		// Check if email exists in database already
		// --------------------------------------------------------------------------- //
		let existingEmailCheck = await checkExistingEmail(userEmail);

		if (existingEmailCheck == true) {
			return responseWithStatus(res, 0, 400, 'Error', EMAIL_EXISTS_ALREADY);
		}
		// --------------------------------------------------------------------------- //
		// Password Confirmation Check
		// --------------------------------------------------------------------------- //
		let confirmPasswordCheck = confirmPassword(userPassword, userConfirmedPassword);

		if (confirmPasswordCheck == false) {
			return responseWithStatus(res, 0, 400, 'Error', PASSWORDS_DONT_MATCH);
		}

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

			return await responseWithStatus(res, 1, 201, 'Sign Up successful!', {
				user_details: userRegistrationResult,
				access_token: accessToken,
				refresh_token: refreshToken,
			});
		} catch (error) {
			console.debug('Error creating record:', error, res);
		}
	}
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
			return await responseWithStatus(res, 0, 400, "Email doesn't exist. Please sign up instead", null);
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

	if (!req.header('Authorization')) {
		return responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please login.');
	} else {
		const token = req.header('Authorization').split(' ')[1];
		// if (!token) return res.status(401).send('Access Denied');

		try {
			const verified = jwt.decode(token, env.ACCESS_TOKEN_SECRET_KEY);
			const userId = verified.id;
			return await responseWithStatus(res, 1, 200, 'Token Verified Successfully', { user_id: `${userId}` });
		} catch (err) {
			return await responseWithStatus(res, 0, 401, 'Invalid Token. Please login.', { error_info: `${err}` });
		}
	}
}

export async function refreshToken(req, res) {
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to renew access and refresh tokens.'
	// #swagger.description = 'Use this in automation as once you detect a status code in the 400 range, you'll need to automatically hit this API'

	if (req.header('Authorization')) {
		const refreshToken = req.header('Authorization').split(' ')[1];
		jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET_KEY, (err, decoded) => {
			if (err) {
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
				return responseWithStatus(res, 1, 201, 'Tokens refreshed successfully', {
					access_token: accessToken,
					refresh_token: refreshToken,
				});
			}
		});
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

// async function forgotPassword(req, res) {
// 	const emailToCheck = Object.values(req.body).toString();

// 	try {
// 		const existingEmailCheck = await checkExistingEmail(emailToCheck)
// 		if (existingEmailCheck == false) {
// 			return await res.format({
// 				json() {
// 					res.send([
// 						{
// 							type: 'error',
// 							message: "Email doesn't exist. Please sign up instead.",
// 						},
// 					]);
// 				},
// 			});
// 		} else {
// 			const currentTimestamp = new Date();
// 			let expirationTimestamp = new Date();
// 			const expiration_time = Number(env.OTP_EXPIRATION_TIME)
// 			expirationTimestamp = new Date(expirationTimestamp.setMinutes(expirationTimestamp.getMinutes() + expiration_time))
// 			const currentTimestampISO = currentTimestamp.toISOString().replace('T', ' ').replace('Z', '')
// 			const expirationTimestampISO = expirationTimestamp.toISOString().replace('T', ' ').replace('Z', '')
// 			const timeDifferenceForHumans = formatDistance(expirationTimestampISO, currentTimestampISO,
// 				{
// 					addSuffix: true,
// 					includeSeconds: true,
// 				}
// 			)
// 			const ConvertExpirationTimestampToLocal = TZDate.tz("Asia/Karachi", expirationTimestamp.setHours(expirationTimestamp.getHours() + 5)).toISOString()

// 			const formattedExpirationTimestamp = formatDate(ConvertExpirationTimestampToLocal, 'PPPPpp').concat(" PKT")
// 			const userID = await getUserIdFromExistingEmail(emailToCheck);

// 			const token = jwt.sign({ id: userID }, env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });

// 			const encryptedToken = await bcrypt.hash(token, 10);
// 			console.log((encryptedToken).toString());

// 			const passwordResetLink = 'https://localhost:5173/reset?' + encryptedToken;
// 			await transporter.sendMail({
// 				from: '"Admin Sender" <test@example.com>',
// 				to: emailToCheck,
// 				subject: `Verify your Email: User ${userID}`,
// 				text: "This is a test email sent via Nodemailer",
// 				html: `<pThis is a <b>test verification email</b> sent via Nodemailer!</p><br/><p>Please click on the following link to reset your password:<br/><a href='${passwordResetLink}'>${passwordResetLink}</a></p><br/>The link expires <b>${timeDifferenceForHumans}</b> on ${formattedExpirationTimestamp}</p>`,
// 			});

// 			return await res.format({
// 				json() {
// 					res.send([
// 						{
// 							type: 'success',
// 							message: "Password reset link has been shared to your email address. Please continue from there.",
// 						},
// 					]);
// 				},
// 			});
// 		}

// 	} catch (error) {
// 		console.log(error);
// 	}
// }
