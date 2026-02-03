import express from 'express';
import { verifyInputFields } from '../middlewares/verifyInputFields.auth.js';
import { forgotPassword, loginUser, refreshToken, registerUser, resetPassword, verifyOTP, verifyUserToken } from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/verifyToken.auth.js';
const router = express.Router();

router.post('/register', verifyInputFields, registerUser);
router.post('/login', verifyInputFields, loginUser);
router.get('/verify-token', verifyToken, verifyUserToken);
router.get('/refresh', refreshToken);
router.post('/forgot-password', verifyInputFields, forgotPassword)
router.post('/verify-otp', verifyInputFields, verifyOTP)
router.post('/reset-password', verifyInputFields, resetPassword)

export default router;
