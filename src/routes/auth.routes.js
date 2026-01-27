import express from 'express';
import { verifyInputFields } from '../middlewares/verifyInputFields.auth.js';
import { forgotPassword, loginUser, refreshToken, registerUser, resetPassword, verifyOTP, verifyUserToken } from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/verifyToken.auth.js';
const router = express.Router();

// router.get('/', validateQueryGetAll, read)
// router.post('/', validateEmployeesInput, create)
// router.patch('/:id', validateUuidUrlParam, update)
// router.delete('/:id', validateUuidUrlParam, remove)
// router.post('/register', verifyInputFields, registerUser)
router.post('/register', verifyInputFields, registerUser);
router.post('/login', verifyInputFields, loginUser);
router.post('/refresh', refreshToken);
router.get('/verify-token', verifyToken, verifyUserToken);
router.post('/forgot-password', verifyInputFields, forgotPassword)
router.post('/verify-otp', verifyOTP)
router.post('/reset-password', resetPassword)
// router.get('/logout', logoutUser)
// router.get('/resend-otp', verifyToken, resendOTP)
// router.get('/verify-access', verifyToken, verifyUserAccess)

export default router;
