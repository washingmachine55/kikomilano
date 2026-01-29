import express from 'express';
import { getAllUsers, getSingleUser } from '../controllers/methods.users.controller.js';
import { uploadUserProfilePicture } from '../controllers/uploadImage.users.controller.js';
import { uploadImages } from '../config/multer.js';
import verifyToken from '../middlewares/verifyToken.auth.js';
const router = express.Router();

router.get('/profile', verifyToken, getSingleUser);
router.get('/', verifyToken, getAllUsers);
router.post(
	'/profile-picture-upload',
	verifyToken,
	uploadImages.single('userProfilePicture'),
	uploadUserProfilePicture
);

export default router;
