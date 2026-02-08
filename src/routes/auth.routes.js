import express from 'express';
import verifyToken from '../middlewares/verifyToken.auth.js';
import {
	forgotPassword,
	loginUser,
	refreshToken,
	registerUser,
	resetPassword,
	verifyOTP,
	verifyUserToken,
} from '../controllers/auth.controller.js';
import { globallyVerifyInputFields } from '../middlewares/globalInputVerification.js';
const router = express.Router();

router.use(globallyVerifyInputFields);
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Endpoint to allow the user to register their account for the first time.
 *     description: This endpoint would only be used once to register a new user
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               name: 'John Doe'
 *               email: 'example@example.com'
 *               password: 'secret_password'
 *               confirmed_password: 'secret_password'
 *     responses:
 *       201:
 *         description: Sign Up successful!
 *         content:
 *           application/json:
 *             example:
 *               status: 201
 *               type: 1
 *               message: Sign Up successful!
 *               data:
 *                 user_details:
 *                   id: '019c0a0c-6a5c-7c53-9686-4f155b77123b'
 *                   email: 'sample@user.com'
 *                   access_type: 0
 *                   created_at: '2026-01-29T13:58:31.772Z'
 *                   first_name: 'Sample'
 *                   last_name: 'User'
 *                   images_id: null
 *                 access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *                 refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *       401:
 *         description: Email already exists. Please sign in instead.
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Endpoint to allow the user to login
 *     description: Used for to normally log in a user that is unauthenticated.
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               email: 'example@example.com'
 *               password: 'secret_password'
 *     responses:
 *       200:
 *         description: Sign in successful!
 *       401:
 *         description: Email doesn't exist. Please sign up instead or Credentials Don't match. Please try again.
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Endpoint to allow the user to send a forgot password request
 *     description: Used for starting a chain to reset a forgotten password.
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               email: 'example@example.com'
 *     responses:
 *       200:
 *         description: An OTP has been shared to your email address. Please use that to reset your password in the next screen.
 *       401:
 *         description: Email doesn't exist. Please sign up instead.
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Endpoint to allow the user to verify their OTP
 *     description: Used for verifying the OTP. Provides a temporary token that needs to be used in /reset-password endpoint
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               email: 'ahmed@admin.com'
 *               otp: '882724'
 *     responses:
 *       200:
 *         description: OTP has been verified!
 *       401:
 *         description: Invalid OTP or email does not exist.
 */
router.post('/verify-otp', verifyOTP);

/**
 * @swagger
 * /auth/verify-token:
 *   get:
 *     summary: Endpoint to allow the user to verify Bearer token. This is different from middleware confirmation.
 *     description: Use this if you want to verify authorization for access to something, or want to get the User's ID for fetching
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token Verified Successfully.
 *       401:
 *         description: Unauthorized. Access Denied. Please login. or Invalid Token. Please login.
 */
router.get('/verify-token', verifyToken, verifyUserToken);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Endpoint to allow the user to renew access and refresh tokens.
 *     description: Use this in automation as once you detect a status code in the 400 range, you'll need to automatically hit this API. Make sure to pass the refresh token instead to get new access and refresh tokens.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tokens refreshed successfully.
 *       401:
 *         description: Unauthorized. Invalid refresh token. or Unauthorized. Invalid token.
 */
router.get('/refresh', refreshToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Endpoint to allow the user to Reset their password
 *     description: Used for resetting the user's password using the temporary token that was obtained in the /verify-otp endpoint
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               email: 'ahmed@admin.com'
 *               password: 'password123'
 *               confirmed_password: 'password123'
 *     responses:
 *       201:
 *         description: Password Reset successful!
 *       400:
 *         description: Passwords don't match. Please try again instead.
 *       401:
 *         description: Unauthorized. Access Denied. Please request another OTP. or Invalid Token. Please request another OTP.
 */
router.post('/reset-password', resetPassword);

export default router;
