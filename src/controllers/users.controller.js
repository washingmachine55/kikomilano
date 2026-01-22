import { env, loadEnvFile } from "node:process";
loadEnvFile();
import { getSingleUserDetails } from "../services/users/getSingle.users.service.js"
import { responseWithStatus } from "../utils/RESPONSES.js"
import jwt from "jsonwebtoken";
import { getAllUsersDetails } from "../services/users/getAll.users.service.js";
import { uploadUserProfilePictureToDB } from "../services/users/uploadPicture.users.service.js";

export async function getSingleUser(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Endpoint to get details of a user that is logged in.'
	if (!req.header('Authorization')) {
		return await responseWithStatus(res, 0, 401, "Unauthorized. Access Denied. Please login.")
	} else {
		const token = req.header('Authorization').split(" ")[1]

		// if (!token) return res.status(401).send('Access Denied');

		const verified = jwt.decode(token, env.ACCESS_TOKEN_SECRET_KEY);
		const userId = verified.id;

		const result = await getSingleUserDetails(userId)
		try {
			await responseWithStatus(res, 1, 200, "User profile details", result)
		} catch (error) {
			console.debug(error)
		}
	}
}

export async function getAllUsers(req, res) {
	// #swagger.tags = ['Users']
	// #swagger.summary = 'Endpoint to get details of all users.'
	const result = await getAllUsersDetails()
	try {
		return await responseWithStatus(res, 1, 200, "Details of all available users", result)
	} catch (error) {
		console.debug(error)
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

	if (!req.file) {
		return await responseWithStatus(res, 0, 400, "No image uploaded. Please upload an image before trying again.", null)
	}

	const result = await uploadUserProfilePictureToDB(req.user.id, req.file)
	try {
		return await responseWithStatus(res, 1, 200, "Image uploaded successfully", result)
	} catch (error) {
		console.debug(error)
	}
}