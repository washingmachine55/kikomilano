export async function successResponse(res, type, statusCode, message, data) {
	return await res.json({
		status: statusCode,
		type: type,
		message: message,
		data: data,
	})
} 

export async function rejectedResponse(res, statusCode, message, data) {
	return await res.json({
		status: statusCode,
		message: message,
		data: data,
	})
} 

export async function unauthorizedResponse(res, statusCode, message, data) {
	return await res.json({
		status: statusCode,
		message: message,
		data: data,
	})
} 

export async function unavailableResponse(res, statusCode, message, data) {
	return await res.json({
		status: statusCode,
		message: message,
		data: data,
	})
} 