import express from 'express';
import { verifyInputFields } from '../middlewares/verifyInputFields.auth.js';
import { loginUser, refreshToken, registerUser, verifyUserToken } from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/verifyToken.auth.js';
const router = express.Router();

// router.get('/', validateQueryGetAll, read)
// router.post('/', validateEmployeesInput, create)
// router.patch('/:id', validateUuidUrlParam, update)
// router.delete('/:id', validateUuidUrlParam, remove)
// router.post('/register', verifyInputFields, registerUser)
router.post('/register', registerUser)
router.post('/login', verifyInputFields, loginUser)
router.post('/refresh', refreshToken)
// router.post('/google-sign-in', verifyGoogleAuth)
router.get('/verify-token', verifyToken, verifyUserToken)
// router.get('/logout', logoutUser)
// router.get('/resend-otp', verifyToken, resendOTP)
// router.post('/verify-otp', verifyToken, verifyOTP)
// router.get('/verify-access', verifyToken, verifyUserAccess)
// router.post('/forgot-password', forgotPassword)

export default router;