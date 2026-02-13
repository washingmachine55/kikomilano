import express from 'express';
import {
    getSingleUser,
    editUserProfile,
    getAllUsers,
    uploadUserProfilePicture,
    getFavorites,
    setFavorite,
    unsetFavorite,
    getUserAddresses,
    saveUserAddress,
    unsetUserAddresses,
} from '../controllers/users.controller.js';
import { } from '../controllers/users.controller.js';
import { uploadImages } from '../config/multer.js';
const router = express.Router();

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
router.get('/', getAllUsers);

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
 *  @swagger
 *  /users/set-favorites:
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

/**
 * @swagger
 * /users/addresses:
 *   post:
 *     summary: Endpoint to a create an address.
 *     description: Allows a logged in user to create an address.
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
 *               address_name: 23s32
 *               address_info: 231, 123 main St Apt 4B, New York, NY 10001
 *     responses:
 *       200:
 *         description: A similar address already exists.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               type: 1
 *               message: User address saved successfully!
 *               data:
 *                 id: '019c5752-250c-7834-9263-8e6a602a4904'
 *                 email: samples@users.czom
 *                 phone_no: 
 *                 access_type: 0
 *                 first_name: Sample
 *                 last_name: Sample
 *                 image_url: images/uploads/userProfilePicture-1770994009070-625979629.png
 *                 address_name: 23ss3ss2
 *                 address_line: 231, 123 main St Apt 4B, New York, NY 10001
 *       409:
 *         description: A similar address already exists.
 *         content:
 *           application/json:
 *             example:
 *               status: 409
 *               type: 0
 *               message: A similar address already exists. Please change values to create another one.
 *               data:
 *                 error_type: Conflicting Record
 *       422:
 *         description: Can not create more than 2 addresses.
 *         content:
 *           application/json:
 *             example:
 *               status: 422
 *               type: 0
 *               message: User can not create more than 2 addresses. Please delete one to create another..
 *               data:
 *                 error_type: Unprocessable Content
 */
router.post('/addresses/', saveUserAddress)

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     summary: Endpoint to get all addresses of a user that is logged in.
 *     description: Just pass the jwt token correctly to get the logged in user's saved addresses.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's addresses.
 *         content:
 *           application/json:
 *             example:
 *                status: 200
 *                type: 1
 *                message: User address fetched successfully!
 *                data:
 *                  addresses_info:
 *                  - address_name: Work
 *                    address_line: 231, 123 main St Apt 4B, New York, NY 10001
 *                  - address_name: Home
 *                    address_line: 242 Greene St, New York, NY 10003, USA
 *  
 *       404:
 *         description: No addresses found.
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               type: 0
 *               message: No addresses found of this user. Create a new address using POST method to see it here later.
 *               data:
 *                 error_type: Entity not found
 *  
 */
router.get('/addresses/', getUserAddresses)

router.post('/addresses/delete', unsetUserAddresses)

export default router;
