import express from 'express';
import { getAllUsers, getSingleUser, uploadUserProfilePicture } from '../controllers/users.controller.js';
// import verifyToken from '../middlewares/verifyToken.auth.js';
import { uploadImages } from '../config/multer.js';
import { getAllProducts, getAllProductVariants } from '../controllers/products.controller.js';
const router = express.Router();

router.get('/', getAllProducts);
router.get('/:productId/variants', getAllProductVariants);
// router.post(
// 	'/profile-picture-upload',
// 	verifyToken,
// 	uploadImages.single('userProfilePicture'),
// 	uploadUserProfilePicture
// );

export default router;
