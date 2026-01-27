/**
 *
 * @param {response} res - normally set as res
 * @param {string} type - string to show if its a success or error message
 * @param {number} statusCode - status code for http request
 * @param {string} message - additional message to show to user for the request
 * @param {object} data - contains the response data as well as nested objects as required.
 * @returns null
 */
export async function responseWithStatus(res, type, statusCode, message, data) {
	const resultData = !data ? [] : data;
	return await res.status(statusCode).type('json').json({
		status: statusCode,
		type: type,
		message: message,
		data: resultData,
	});
}
