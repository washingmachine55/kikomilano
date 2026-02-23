import express from 'express';
import {
	getSingleUser,
	editUserProfile,
	uploadUserProfilePicture,
	getFavorites,
	setFavorite,
	unsetFavorite,
	getUserAddresses,
	saveUserAddress,
	unsetUserAddresses,
} from '@controllers/users.controller';
import { uploadImages } from '@config/multer';
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
 *         content:
 *           application/json:
 *              example:
 *                 status: 200
 *                 type: 1
 *                 message: User profile details
 *                 data:
 *                 user_details:
 *                     users_id: 019c66e4-017d-7330-be72-04f480b2f32d
 *                     first_name: Sample
 *                     last_name: Sample
 *                     email: samples@users.com
 *                     phone_no: null
 *                     access_type: 0
 *                     image_url: null
 *                     created_at: '2026-02-16T14:39:04.573Z'
 *       401:
 *         description: Unauthorized. Access Denied. Please login.
 */
router.get('/profile', getSingleUser);

/**
 * @swagger
 * /users/profile/edit:
 *   post:
 *     summary: Endpoint to edit user profile details.
 *     description: Allows a logged in user to update their profile information like name, email, and password. Unable to add it to docs but **all fields are optional**, *except* if **password** is passed, then **confirmed_password** is also *required*.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
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
 *         content:
 *            application/json:
 *              example:
 *                  status: 200
 *                  type: 1
 *                  message: User profile edited successfully
 *                  data:
 *                    users_id: 019c66e4-017d-7330-be72-04f480b2f32d
 *                    first_name: ww
 *                    last_name: aa
 *                    email: sample@users.com
 *                    phone_no: null
 *                    access_type: 0
 *                    image_url: null
 *                    created_at: '2026-02-16T14:39:04.573Z'
 */
router.post('/profile/edit', editUserProfile);

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
 *               products_variants_id: 'product-variant-uuid'
 *     responses:
 *       200:
 *         description: Product added to favorites
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               type: 1
 *               message: Product added to favorites
 *               data:
 *                  id: 019c6a3e-cc64-76e3-b126-77f7137f2a51
 *                  users_id: 019c69ec-e0d1-7b19-abfd-7aa0acc96054
 *                  products_variants_id: 019c69eb-0902-75da-b289-be02c76a8051
 *                  created_by: 019c69ec-e0d1-7b19-abfd-7aa0acc96054
 *                  created_at: '2026-02-17T06:17:06.404Z'
 *                  deleted_by: null
 *                  deleted_at: null
 *                  status: 1
 *       409:
 *         description: Conflict in database records
 *         content:
 *           application/json:
 *             example:
 *               status: 409
 *               type: 0
 *               message: Product already set as a favorite
 *               data:
 *                 error_type: Conflicting Record
 *       404:
 *         description: Unable to find the product
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               type: 0
 *               message: Unable to find the product you are trying to favorite
 *               data:
 *                  error_type: Entity not found

 */
router.post('/set-favorites', setFavorite);

/**
 * @swagger
 * /users/remove-favorites:
 *   post:
 *     summary: Endpoint to remove a product favorite of a user that is logged in.
 *     description: POST request to pass the product variant ids in an Array to remove from user's favorites.
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
 *               products_variants_array:
 *                   - 019c69eb-08e8-76a7-bd01-f06a73c96236
 *                   - 019c69eb-0902-75da-b289-be02c76a8051
 *     responses:
 *       200:
 *         description: Product removed from favorites
 *         content:
 *           application/json:
 *             example:
 *                status: 200
 *                type: 1
 *                message: Product(s) removed from favorites successfully!
 *                data:
 *                - id: 019c6a3e-8e2c-79d6-b83c-c7c018992b11
 *                  users_id: 019c69ec-e0d1-7b19-abfd-7aa0acc96054
 *                  products_variants_id: 019c69eb-08e8-76a7-bd01-f06a73c96236
 *                  created_by: 019c69ec-e0d1-7b19-abfd-7aa0acc96054
 *                  created_at: '2026-02-17T06:16:50.476Z'
 *                  deleted_by: 019c69ec-e0d1-7b19-abfd-7aa0acc96054
 *                  deleted_at: '2026-02-17T06:19:54.916Z'
 *                  status: 0
 *                - id: 019c6a3e-cc64-76e3-b126-77f7137f2a51
 *                  users_id: 019c69ec-e0d1-7b19-abfd-7aa0acc96054
 *                  products_variants_id: 019c69eb-0902-75da-b289-be02c76a8051
 *                  created_by: 019c69ec-e0d1-7b19-abfd-7aa0acc96054
 *                  created_at: '2026-02-17T06:17:06.404Z'
 *                  deleted_by: 019c69ec-e0d1-7b19-abfd-7aa0acc96054
 *                  deleted_at: '2026-02-17T06:19:54.922Z'
 *                  status: 0
 *       404:
 *         description: Unable to find product
 *         content:
 *           application/json:
 *             example:
 *                status: 404
 *                type: 0
 *                message: 'Unable to reference product with id [019c69eb-08e8-76a7-bd01-f06a73c96236]'
 *                data:
 *                  error_type: Entity not found

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
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               type: 1
 *               message: User's favorite products
 *               data:
 *               - product_id: 019c69eb-08e6-7a19-851e-5d0f41b42dca
 *                 product_name: Ergonomic Marble Mouse
 *                 products_variants_id: 019c69eb-08e8-76a7-bd01-f06a73c96236
 *                 product_variant_name: Ergonomic
 *                 price_retail: '60.75'
 *                 image_url: 'https://picsum.photos/seed/ebU6vd22/2256/1434'
 *               - product_id: 019c69eb-0901-7d28-a0fc-ffba10fd6f7d
 *                 product_name: Modern Plastic Mouse
 *                 products_variants_id: 019c69eb-0902-75da-b289-be02c76a8051
 *                 product_variant_name: Frozen
 *                 price_retail: '61.69'
 *                 image_url: 'https://picsum.photos/seed/TE9rC5/563/808'
 *       401:
 *         description: Unauthorized. Access Denied. Please login.
 *         content:
 *             application/json:
 *                example:
 *                  status: 404
 *                  type: 0
 *                  message: No products in user's favorites
 *                  data:
 *                     error_type: Entity not found
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

/**
 * @swagger
 * /users/addresses/delete:
 *   post:
 *     summary: Endpoint to a delete/remove an address.
 *     description: Allows a logged in user to remove a created address.
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
 *               addresses_array: 
 *                  - "019c58f1-2228-7758-9c96-6cf4800da4be"
 *     responses:
 *       200:
 *         description: A similar address already exists.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               type: 1
 *               message: User address removed successfully!
 *               data:
 *               deleted_addresses_id:
 *                   - 019c69c4-b64b-7939-93b5-418cbc51b384
 *       404:
 *         description: A similar address already exists.
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               type: 0
 *               message: 'Address ID [019c69c4-b64b-7939-93b5-418cbc51b384] does not exist in database.'
 *               data:
 *                 error_type: Entity not found
 */
router.post('/addresses/delete', unsetUserAddresses)

export default router;
