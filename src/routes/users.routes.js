import express from 'express';
import { editUserProfile, getAllUsers, getFavorites, getSingleUser, setFavorite, unsetFavorite } from '../controllers/methods.users.controller.js';
import { uploadUserProfilePicture } from '../controllers/uploadImage.users.controller.js';
import { uploadImages } from '../config/multer.js';
import verifyToken from '../middlewares/verifyToken.auth.js';
import { verifyInputFields } from '../middlewares/verifyInputFields.users.js';
const router = express.Router();

router.get('/profile', verifyToken, getSingleUser);
router.post('/profile/edit', editUserProfile);
router.get('/', verifyToken, getAllUsers);
router.post(
	'/profile-picture-upload',
	verifyToken,
	uploadImages.single('userProfilePicture'),
	uploadUserProfilePicture
);
router.post("/set-favorites", verifyInputFields, setFavorite)
router.post("/remove-favorites", unsetFavorite)
router.get("/favorites", getFavorites)

export default router;
