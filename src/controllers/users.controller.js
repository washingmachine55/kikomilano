import { env, loadEnvFile } from 'node:process';
loadEnvFile();
import { getSingleUserDetails } from '../services/users/getSingle.users.service.js';
import { responseWithStatus } from '../utils/responses.js';
import jwt from 'jsonwebtoken';
import { getAllUsersDetails } from '../services/users/getAll.users.service.js';
import { uploadUserProfilePictureToDB } from '../services/users/uploadPicture.users.service.js';
import { verifyJwtAsync } from '../utils/jwtUtils.js';
import { saveProductFavorite } from '../services/users/setFavorite.users.service.js';
import { deleteProductFavorite } from '../services/users/unsetFavorite.users.service.js';
import { getAllProductsFavorites } from '../services/users/getAllFavorites.users.service.js';
import { attempt, BadRequestError, NotFoundError, trialCapture, UnprocessableContentError } from '../utils/errors.js';
import { allowedFieldsFunc } from '../utils/dynamicAllowedFields.js';
import { editUserDetails } from '../services/users/editUserDetails.users.service.js';
import { saveAddress } from '../services/users/saveAddress.users.service.js';
import { isValidUUID } from '../utils/validateUUID.js';

export async function getAllUsers(req, res) {
	const result = await getAllUsersDetails();
	try {
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

export const getSingleUser = await attempt(async (req, res, next) => {
	const userId = req.user.id
	const result = await getSingleUserDetails(userId);
	return await responseWithStatus(res, 1, 200, 'User profile details', { user_details: result });
});

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

export const setFavorite = await attempt(async (req, res, next) => {
	const userId = req.user.id;
	const productVariantId = req.body.data.products_variants_id;

	const result = await saveProductFavorite(userId, productVariantId);
	await responseWithStatus(res, 1, 200, 'Product added to favorites', result);
});

export const unsetFavorite = await attempt(async (req, res, next) => {
	const userId = req.user.id;
	const productVariantId = req.body.data.products_variants_id;

	await isValidUUID(productVariantId)
	const result = await deleteProductFavorite(userId, productVariantId);
	if (result === false) {
		await responseWithStatus(res, 1, 200, 'Product already removed');
	} else {
		await responseWithStatus(res, 1, 200, 'Product removed from favorites', result);
	}
});

export const getFavorites = await attempt(async (req, res, next) => {
	const userId = req.user.id;
	const result = await getAllProductsFavorites(userId);
	await responseWithStatus(res, 1, 200, "User's favorite products", result);
});
