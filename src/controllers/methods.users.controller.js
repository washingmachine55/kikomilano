import { env, loadEnvFile } from 'node:process';
loadEnvFile();
import { getSingleUserDetails } from '../services/users/getSingle.users.service.js';
import { responseWithStatus } from '../utils/RESPONSES.js';
import jwt from 'jsonwebtoken';
import { getAllUsersDetails } from '../services/users/getAll.users.service.js';
import { uploadUserProfilePictureToDB } from '../services/users/uploadPicture.users.service.js';
import { verifyJwtAsync } from '../utils/jwtUtils.js';
import { saveProductFavorite } from '../services/users/setFavourite.users.service.js';
import { deleteProductFavorite } from '../services/users/unsetFavourite.users.service.js';
import { getAllProductsFavorites } from '../services/users/getAllFavorites.users.service.js';

export async function getAllUsers(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Endpoint to get details of all users.'
	const result = await getAllUsersDetails();
	try {
		// #swagger.responses[200] = { description: 'Details of all available users' }
		return await responseWithStatus(res, 1, 200, 'Details of all available users', { users_details: result });
	} catch (error) {
		console.debug(error);
	}
}

export async function uploadUserProfilePicture(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = "Endpoint to upload user's profile picture."
	/* #swagger.requestBody = {
		required: true,
		content: {
			"multipart/form-data": {
				example: {
					userProfilePicture: "Sample"
				}
			}
		}
	}
	*/
	// #swagger.responses[415] = { description: 'Form field does not satisfy requirement. Please enter the correct field name for uploading the file.' }
	// #swagger.responses[413] = { description: `File is too large. Maximum size is 1MB.` }

	if (!req.file) {
		// #swagger.responses[400] = { description: 'No image uploaded. Please upload an image before trying again.' }
		return await responseWithStatus(
			res,
			0,
			400,
			'No image uploaded. Please upload an image before trying again.',
		);
	}

	const result = await uploadUserProfilePictureToDB(req.user.id, req.file);
	try {
		// #swagger.responses[200] = { description: 'Image uploaded successfully' }
		return await responseWithStatus(res, 1, 200, 'Image uploaded successfully', result);
	} catch (error) {
		console.debug(error);
	}
}

export async function getSingleUser(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Endpoint to get details of a user that is logged in.'
	// #swagger.description = 'Just pass the jwt token correctly to get the logged in user's profile.'
	/*  #swagger.auto = false
		#swagger.path = '/users/profile'
		#swagger.method = 'get'
		#swagger.produces = ['application/json']
		#swagger.consumes = ['application/json']
	*/

	if (!req.header('Authorization')) {
		// #swagger.responses[401] = { description: 'Unauthorized. Access Denied. Please login.' }
		return await responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please login.');
	} else {
		const token = req.header('Authorization').split(' ')[1];
		const verified = jwt.verify(token, env.ACCESS_TOKEN_SECRET_KEY);
		const userId = verified.id;
		const result = await getSingleUserDetails(userId);
		try {
			// #swagger.responses[200] = { description: 'User profile details.' }
			await responseWithStatus(res, 1, 200, 'User profile details', { user_details: result });
		} catch (error) {
			console.debug(error);
		}
	}
}

export async function setFavorite(req, res) {
	const userId = req.body.data.users_id
	const productVariantId = req.body.data.products_variants_id

	try {
		const result = await saveProductFavorite(userId, productVariantId)
		await responseWithStatus(res, 1, 200, "Product added to favorites", result)
	} catch (err) {
		if (err.code === '23503' || err.code === '23505') {
			await responseWithStatus(res, 1, 409, "An error occured", "Conflict in database records")
		} else {
			await responseWithStatus(res, 0, 422, "An error occurred", err.message)
		}
	}
}

export async function unsetFavorite(req, res) {
	const userId = req.body.data.users_id
	const productVariantId = req.body.data.products_variants_id

	try {
		const result = await deleteProductFavorite(userId, productVariantId)

		if (result === false) {
			await responseWithStatus(res, 1, 422, "Error removing product from favorites")
		} else {
			await responseWithStatus(res, 1, 200, "Product removed from favorites", result)
		}
	} catch (err) {
		await responseWithStatus(res, 2, 500, "An error occurred", err)
	}
}

export async function getFavorites(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Endpoint to get all product favorites of a user that is logged in.'
	// #swagger.description = 'Just pass the jwt token correctly to get the logged in user's product favorites.'

	if (!req.header('Authorization')) {
		// #swagger.responses[401] = { description: 'Unauthorized. Access Denied. Please login.' }
		return await responseWithStatus(res, 0, 401, 'Unauthorized. Access Denied. Please login.');
	} else {
		const token = req.header('Authorization').split(' ')[1];
		const verified = jwt.verify(token, env.ACCESS_TOKEN_SECRET_KEY);
		const userId = verified.id;
		try {
			const result = await getAllProductsFavorites(userId);
			// #swagger.responses[200] = { description: 'User profile details.' }
			await responseWithStatus(res, 1, 200, "User's favorite products", result);
		} catch (error) {
			console.debug(error);
		}
	}
}