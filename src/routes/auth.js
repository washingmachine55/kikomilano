import express from 'express';
import {
	registerUser,
	loginUser,
	logoutUser,
	verifyUserToken,
	resendOTP,
	verifyOTP,
	verifyUserAccess,
	forgotPassword
} from '../controllers/authController.js';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
import { verifyInputFields } from '../middlewares/verifyInputFields.js';

// router.get('/register', cors(), registerUser)
router.post('/register', verifyInputFields, registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)
router.get('/verify-token', verifyToken, verifyUserToken)
router.get('/resend-otp', verifyToken, resendOTP)
router.post('/verify-otp', verifyToken, verifyOTP)
router.get('/verify-access', verifyToken, verifyUserAccess)
router.post('/forgot-password', forgotPassword)

export default router;