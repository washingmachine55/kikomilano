import { responseWithStatus } from './responses.js';
process.loadEnvFile();

/**
 *
 * @param {String} errorMessage - Optional message about the error
 * @param {Any} data - Optional object/string/number etc pertaining the error
 * @param {Response} res - Optional if being used in staging to show errors in responses
 * @returns debugging information in response/console depending on NODE_ENV variable
 */
export const envLogger = async (errorMessage = null, data = null, res = null) => {
	if (process.env.NODE_ENV == 'staging') {
		return responseWithStatus(res, 0, 500, errorMessage, data);
	} else if (process.env.NODE_ENV == 'dev') {
		console.debug('Error Message: ' + errorMessage);
		console.debug('Error Data: ' + data);
		return responseWithStatus(res, 0, 500, errorMessage, data);
	} else {
		return null;
	}
};

export default envLogger;
