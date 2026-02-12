import { env, loadEnvFile } from 'node:process';
loadEnvFile();
import { getSingleUserDetails } from '../services/users/getSingle.users.service.js';
import { responseWithStatus } from '../utils/responses.js';
import jwt from 'jsonwebtoken';
import { getAllUsersDetails } from '../services/users/getAll.users.service.js';
import { uploadUserProfilePictureToDB } from '../services/users/uploadPicture.users.service.js';
import { verifyJwtAsync } from '../utils/jwtUtils.js';
import { saveProductFavorite } from '../services/users/setFavourite.users.service.js';
import { deleteProductFavorite } from '../services/users/unsetFavourite.users.service.js';
import { getAllProductsFavorites } from '../services/users/getAllFavorites.users.service.js';
import { attempt, BadRequestError, NotFoundError, trialCapture, ValidationError } from '../utils/errors.js';
import { allowedFieldsFunc } from '../utils/dynamicAllowedFields.js';
import { editUserDetails } from '../services/users/editUserDetails.users.service.js';
import { saveAddress } from '../services/users/saveAddress.users.service.js';

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
	if (!req.file) {
		return await responseWithStatus(res, 0, 400, 'No image uploaded. Please upload an image before trying again.');
	}

	const result = await uploadUserProfilePictureToDB(req.user.id, req.file);
	try {
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

export const saveUserAddress = await attempt(async (req, res, next) => {
	const addressName = req.body.data.address_name
	const addressInfo = req.body.data.address_info
	// const modifiedAddressInfo = await parseSingleAddressLine(addressInfo);
	const result = await saveAddress(addressName, addressInfo, req.user.id);
	return responseWithStatus(res, 1, 200, "User address saved successfully!", result)
});

// export const getUserAddresses = await attempt(async (req, res, next) => {
// 	const addressName = req.body.data.address_name
// 	const addressInfo = req.body.data.address_info
// 	// const modifiedAddressInfo = await parseSingleAddressLine(addressInfo);
// 	const result = await saveAddress(addressName, addressInfo, req.user.id);
// 	return responseWithStatus(res, 1, 200, "User address saved successfully!", result)
// });

export const editUserProfile = await attempt(async (req, res) => {
	const allowedFields = ['name', 'email', 'password', 'confirmed_password'];
	const fieldsToUpdate = await allowedFieldsFunc(allowedFields, req.body.data);

	const token = req.header('Authorization').split(' ')[1];
	const verified = await verifyJwtAsync(token, env.ACCESS_TOKEN_SECRET_KEY);

	const result = await editUserDetails(fieldsToUpdate, verified.id);
	return await responseWithStatus(res, 1, 200, 'User profile edited successfully', result);
});

export async function setFavorite(req, res) {
	const userId = req.body.data.users_id;
	const productVariantId = req.body.data.products_variants_id;

	try {
		const result = await saveProductFavorite(userId, productVariantId);
		await responseWithStatus(res, 1, 200, 'Product added to favorites', result);
	} catch (err) {
		if (err.code === '23503' || err.code === '23505') {
			await responseWithStatus(res, 1, 409, 'An error occured', 'Conflict in database records');
		} else {
			await responseWithStatus(res, 0, 422, 'An error occurred', err.message);
		}
	}
}

export const unsetFavorite = await attempt(async (req, res, next) => {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Endpoint to remove a product favorite of a user that is logged in.'
	// #swagger.description = "POST request to pass the user id and the product variant id to remove from user's favorites."

	const userId = req.body.data.users_id;
	const productVariantId = req.body.data.products_variants_id;

	if (!req.body.data.products_variants_id) {
		throw new ValidationError('Product ID must not be empty, please provide a valid product ID');
	}

	const result = await deleteProductFavorite(userId, productVariantId);
	if (result === false) {
		await responseWithStatus(res, 1, 200, 'Product already removed');
	} else {
		await responseWithStatus(res, 1, 200, 'Product removed from favorites', result);
	}
});

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
