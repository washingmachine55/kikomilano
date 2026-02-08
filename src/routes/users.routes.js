import express from 'express';
import {
	editUserProfile,
	getAllUsers,
	getFavorites,
	getSingleUser,
	setFavorite,
	unsetFavorite,
} from '../controllers/methods.users.controller.js';
import { uploadUserProfilePicture } from '../controllers/uploadImage.users.controller.js';
import { uploadImages } from '../config/multer.js';
import verifyToken from '../middlewares/verifyToken.auth.js';
const router = express.Router();

router.use(verifyToken);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Endpoint to get details of a user that is logged in.
 *     description: Just pass the jwt token correctly to get the logged in user's profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details.
 *       401:
 *         description: Unauthorized. Access Denied. Please login.
 */
router.get('/profile', getSingleUser);

/**
 * @swagger
 * /users/profile/edit:
 *   post:
 *     summary: Endpoint to edit user profile details.
 *     description: Allows a logged in user to update their profile information like name, email, and password.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               name: 'Updated Name'
 *               email: 'newemail@example.com'
 *               password: 'newpassword'
 *               confirmed_password: 'newpassword'
 *     responses:
 *       200:
 *         description: User profile edited successfully.
 */
router.post('/profile/edit', editUserProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Endpoint to get details of all users.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Details of all available users
 */
router.get('/', verifyToken, getAllUsers);

/**
 * @swagger
 * /users/profile-picture-upload:
 *   post:
 *     summary: Endpoint to upload user's profile picture.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userProfilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No image uploaded. Please upload an image before trying again.
 *       413:
 *         description: File is too large. Maximum size is 1MB.
 *       415:
 *         description: Form field does not satisfy requirement. Please enter the correct field name for uploading the file.
 */
router.post('/profile-picture-upload', uploadImages.single('userProfilePicture'), uploadUserProfilePicture);

/**
 * @swagger
 * /users/set-favorites:
 *   post:
 *     summary: Endpoint to add a product to user's favorites.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               users_id: 'user-uuid'
 *               products_variants_id: 'product-variant-uuid'
 *     responses:
 *       200:
 *         description: Product added to favorites
 *       409:
 *         description: Conflict in database records
 *       422:
 *         description: An error occurred with the provided data.
 */
router.post('/set-favorites', setFavorite);

/**
 * @swagger
 * /users/remove-favorites:
 *   post:
 *     summary: Endpoint to remove a product favorite of a user that is logged in.
 *     description: POST request to pass the user id and the product variant id to remove from user's favorites.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               users_id: 'user-uuid'
 *               products_variants_id: 'product-variant-uuid'
 *     responses:
 *       200:
 *         description: Product removed from favorites or already removed
 */
router.post('/remove-favorites', unsetFavorite);

/**
 * @swagger
 * /users/favorites:
 *   get:
 *     summary: Endpoint to get all product favorites of a user that is logged in.
 *     description: Just pass the jwt token correctly to get the logged in user's product favorites.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's favorite products
 *       401:
 *         description: Unauthorized. Access Denied. Please login.
 */
router.get('/favorites', getFavorites);

export default router;
