// import { sendVerificationEmail, compareValidOTP, userIsVerifiedCheck } from '../services/auth/sendAndSaveVerificationEmailDatabaseService.js';
import { getUserId, isCredentialsMatching } from '../services/auth/authenticateUserDatabaseService.js';
import { checkExistingEmail } from '../services/auth/checkExistingEmail.auth.service.js';
import registerUserToDatabase from '../services/auth/registerDatabaseService.js';
import { confirmPassword } from '../utils/confirmPassword.js';

import jwt from 'jsonwebtoken';
// import verifyUserAccessFromDatabase from '../services/verifyUserAccessDatabaseService.js';
// import { formatDate, formatDistance } from 'date-fns';
// import { TZDate } from '@date-fns/tz';
// import transporter from '../config/mailTransporter.js';
import {env} from 'node:process';
import { rejectedResponse } from '../utils/RESPONSES.js';
import { EMAIL_EXISTS_ALREADY, MISSING_INPUT_FIELDS, PASSWORDS_DONT_MATCH } from '../utils/CONSTANTS.js';
const JWT_SECRET_KEY = env.JWT_SECRET_KEY;

export async function registerUser(req, res) {
	// #swagger.tags = ['Authentication']
	/*  #swagger.requestBody = {
			required: true,
			schema: { $ref: "#/components/schemas/authSchema" }  
		} 
	*/

	/*  #swagger.parameters['body'] = {
		in: 'body',
		description: 'Some description...',
		required: true,
		schema: {
			data: {
				name: 'John Doe',
				email: 'example@example.com',
				password: 'secret_password',
				hashedPassword: 'secret_password'
			}
		}
	} */

	
	let request = Object.values(req.body.data);
	let userName = request[0];
	let userEmail = request[1];
	let userPassword = request[2];
	let userConfirmedPassword = request[3];

	if (userName == null || userEmail == null || userPassword == null || userConfirmedPassword == null) {
		return rejectedResponse(res, 200, 'Error', MISSING_INPUT_FIELDS)
	} else {

	// --------------------------------------------------------------------------- //
	// Check if email exists in database already
	// --------------------------------------------------------------------------- //
	let existingEmailCheck = await checkExistingEmail(userEmail);

	if (existingEmailCheck == true) {
		return rejectedResponse(res, 200, 'Error', EMAIL_EXISTS_ALREADY)
	}
	// --------------------------------------------------------------------------- //
	// Password Confirmation Check
	// --------------------------------------------------------------------------- //
	let confirmPasswordCheck = confirmPassword(userPassword, userConfirmedPassword);

	if (confirmPasswordCheck == false) {
		return rejectedResponse(res, 200, 'Error', PASSWORDS_DONT_MATCH)
	}

		// --------------------------------------------------------------------------- //
		// Save User details to Database if all checks are cleared
		// --------------------------------------------------------------------------- //
		const entryArray = [userName, userEmail, userPassword];
		try {
			const userRegistrationResult =  await registerUserToDatabase(entryArray);
			

			// let emailSent = await sendVerificationEmail(userId);

			const token = jwt.sign({ id: userRegistrationResult.id }, JWT_SECRET_KEY, { expiresIn: '1h' });
			console.log(token);
			
			return res.format({
				json() {
					res.send([
						{
							type: 'success',
							message: 'Registered Successfully!',
							data: {
								user_id: userRegistrationResult.id,
								token: token,
							}
						},
					]);
				},
			});
		} catch (error) {
			console.error('Error creating record:', error);
		}
	}
}

export async function loginUser(req, res) {
	// #swagger.tags = ['Authentication']
	// #swagger.summary = 'Endpoint to allow the user to login'

	let request = Object.values(req.body.data);
	let userEmail = request[0];
	let userPassword = request[1];

	try {
		// --------------------------------------------------------------------------- //
		// Check if email doesn't exist in database already
		// --------------------------------------------------------------------------- //
		let existingEmailCheck = await checkExistingEmail(userEmail);

		if (existingEmailCheck == false) {
			return await res.format({
				json() {
					res.send([
						{
							type: 'error',
							message: "Email doesn't exist. Please sign up instead.",
							data: {
								token: 'Invalid Token' 
							}
						},
					]);
				},
			});
		} else if (existingEmailCheck == true) {
			// --------------------------------------------------------------------------- //
			// Email and Password Combination Check
			// --------------------------------------------------------------------------- //
			let credentialMatchingResult = await isCredentialsMatching(userEmail, userPassword);
			if (credentialMatchingResult == true) {
				let userId = await getUserId(userEmail, userPassword);
				const token = jwt.sign({ id: userId }, JWT_SECRET_KEY, { expiresIn: '1h' });

				return await res.format({
					json() {
						res.send([
							{
								type: 'success',
								message: 'Sign in successful!',
								data: {
									token: token
								}
							},
						]);
					},
				});
			} else {
				return await res.format({
					json() {
						res.send([
							{
								type: 'error',
								message: "Credentials Don't match. Please try again.",
								data: {
									token: 'Invalid Token' 
								}
							},
						]);
					},
				});
			}
		}
	} catch (error) {
		console.error('Error creating record:', error);
	}
}

// async function logoutUser(req, res) {
// 	const token = req.header('authorization');
// 	try {
// 		const decoded = jwt.verify(token, JWT_SECRET_KEY);
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

// async function verifyUserToken(req, res) {
// 	const token = req.header('Authorization');

// 	if (!token) return res.status(401).send('Access Denied');

// 	try {
// 		const verified = jwt.verify(token, JWT_SECRET_KEY);
// 		const userId = verified.id;
// 		res.status(200).json([
// 			{
// 				type: 'success',
// 				message: 'Verified Token',
// 			},
// 			{ user_id: userId },
// 			{ Authorization: token },
// 		]);
// 	} catch (err) {
// 		res.status(400).send('Invalid Token. Please login. ' + err);
// 	}
// }

// async function resendOTP(req, res) {

// 	const token = req.header('Authorization');
// 	if (!token) return res.status(401).send('Access Denied');

// 	try {
// 		const verified = jwt.verify(token, JWT_SECRET_KEY);
// 		const userId = verified.id;

// 		const userIsVerified = await userIsVerifiedCheck(userId)

// 		if (userIsVerified == true) {
// 			return res.status(200).json([
// 				{
// 					type: 'error',
// 					message: 'You are already verified',
// 				},
// 				{ user_id: userId },
// 				{ Authorization: token },
// 			]);
// 		}

// 		let emailSent = await sendVerificationEmail(userId);

// 		if (emailSent == true) {
// 			return res.status(200).json([
// 				{
// 					type: 'success',
// 					message: 'OTP has been resent to your email. Please check your inbox',
// 				},
// 				{ user_id: userId },
// 				{ Authorization: token },
// 			]);
// 		} else {
// 			return res.status(200).json([
// 				{
// 					type: 'error',
// 					message: 'An error has occurred. Please try again later.',
// 				},
// 				{ user_id: userId },
// 				{ Authorization: token },
// 			]);
// 		}
// 	} catch (error) {
// 		res.status(400).send('Invalid Token. Please login.' + error);
// 	}

// }

// async function verifyOTP(req, res) {

// 	const token = req.header('Authorization');
// 	if (!token) return res.status(401).send('Access Denied');

// 	const requestOTP = req.body.otp

// 	try {
// 		const verified = jwt.verify(token, JWT_SECRET_KEY);
// 		const userId = verified.id;

// 		const userIsVerified = await userIsVerifiedCheck(userId)

// 		if (requestOTP.length < 6) {
// 			return await res.format({
// 				json() {
// 					res.send([
// 						{
// 							type: 'error',
// 							message: "OTP is not complete",
// 						},
// 					]);
// 				},
// 			});
// 		} else {
// 			if (userIsVerified == true) {
// 				return res.status(200).json([
// 					{
// 						type: 'error',
// 						message: 'You are already verified',
// 					},
// 					{ user_id: userId },
// 					{ Authorization: token },
// 				]);
// 			} else {

// 				let result = await compareValidOTP(userId, requestOTP)

// 				if (result == true) {
// 					return await res.format({
// 						json() {
// 							res.send([
// 								{
// 									type: 'success',
// 									message: "OTP is correct. Your account is successfully verified!",
// 								},
// 							]);
// 						},
// 					});
// 				} else {
// 					return await res.format({
// 						json() {
// 							res.send([
// 								{
// 									type: 'error',
// 									message: "OTP is not correct. Please re-enter OTP.",
// 								},
// 							]);
// 						},
// 					});
// 				}
// 			}
// 		}

// 	} catch (error) {
// 		res.status(400).send('Invalid Token. Please login.' +error);
// 	}
// }

// async function verifyUserAccess(req, res) {
// 	const token = req.header('Authorization');
// 	if (!token) return res.status(401).send('Access Denied');

// 	try {
// 		const verified = jwt.verify(token, JWT_SECRET_KEY);
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

// 			const token = jwt.sign({ id: userID }, JWT_SECRET_KEY, { expiresIn: '1h' });

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

// export { registerUser, loginUser, logoutUser, verifyUserToken, resendOTP, verifyOTP, verifyUserAccess, forgotPassword };
