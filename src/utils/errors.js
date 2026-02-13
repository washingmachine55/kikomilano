/**
 *  Async wrapper to pass errors to the Global Error Handling (GEH) Middleware
 *  
 *  @param {Function} func - Async function which passes errors to the GEH middleware
 *  @returns null
 */
export const attempt = async (func) => {
	return (res, req, next) => {
		func(res, req, next).catch((err) => next(err));
	};
};

/**
 *  TryCatch alternative, inspired by Go
 *  
 *  @param {Async Function} promise
 *  @returns Array of either a resolved promise, or an error
 */
export const trialCapture = async (promise) => {
	try {
		const result = await promise;
		return [result, null];
	} catch (error) {
		console.log(error);
		return [null, error];
	}
};

/**
 * 	The HTTP 422 Unprocessable Content client error response status code indicates that the
 *  server understood the content type of the request content, and the syntax of the request content 
 *  was correct, but it was unable to process the contained instructions.
 *	
 *  Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422
 */
export class UnprocessableContentError extends Error {
	constructor(message) {
		super(message); // Call the parent Error constructor
		this.name = 'Unprocessable Content'; // Set a custom name
		this.message = message;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, UnprocessableContentError);
		}
	}
}

/**
 * 	The HTTP 400 Bad Request client error response status code indicates that the server would not
 *  process the request due to something the server considered to be a client error. The reason for
 *  a 400 response is typically due to malformed request syntax, invalid request message framing, 
 *  or deceptive request routing.
 *	
 *  Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/400
 */
export class BadRequestError extends Error {
	constructor(message) {
		super(message); // Call the parent Error constructor
		this.name = 'Bad Request Error'; // Set a custom name
		this.message = message;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, UnprocessableContentError);
		}
	}
}
/**
 *  The HTTP 409 Conflict client error response status code indicates a request conflict with the current state of 
 *  the target resource. In other words, 409 conflict responses are errors sent to the client so that a user 
 *  might be able to resolve a conflict and resubmit the request.
 *  Additionally, you may get a 409 response when uploading a file that is older than the existing one on the
 *  server, resulting in a version control conflict.
 *  
 *  Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409
 */
export class ConflictError extends Error {
	constructor(message, details) {
		super(message); // Call the parent Error constructor
		this.name = 'Conflicting Record'; // Set a custom name
		this.message = message;
		this.cause = details;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConflictError);
		}
	}
}
/**
 *  The HTTP 404 Not Found client error response status code indicates that the server cannot find the requested
 *  resource.Links that lead to a 404 page are often called broken or dead links and can be subject to link rot.
 *  
 *  A 404 status code only indicates that the resource is missing without indicating if this is temporary 
 *  or permanent.
 *  
 *  Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404
 */
export class NotFoundError extends Error {
	constructor(message, details) {
		super(message); // Call the parent Error constructor
		this.name = 'Entity not found'; // Set a custom name
		this.message = message;
		this.cause = details;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConflictError);
		}
	}
}

/**
 *  The HTTP 403 Forbidden client error response status code indicates that the server understood the 
 *  request but refused to process it.This status is similar to 401, except that for 403 Forbidden responses,
 *  authenticating or re - authenticating makes no difference.The request failure is tied to application logic, 
 *  such as insufficient permissions to a resource or action.
 *  
 *  Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403
*/
export class ForbiddenError extends Error {
	constructor(message, details) {
		super(message); // Call the parent Error constructor
		this.name = 'Forbidden Request'; // Set a custom name
		this.message = message;
		this.cause = details;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConflictError);
		}
	}
}

/**
 *  The HTTP 401 Unauthorized client error response status code indicates that a request was not successful
 *  because it lacks valid authentication credentials for the requested resource.
 *  A 401 Unauthorized is similar to the 403 Forbidden response, except that a 403 is returned when a 
 *  request contains valid credentials, but the client does not have permissions to perform a certain action.
 *  
 *  Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401
 */
export class UnauthorizedError extends Error {
	constructor(message, details) {
		super(message); // Call the parent Error constructor
		this.name = 'Unauthorized Request'; // Set a custom name
		this.message = message;
		this.cause = details;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConflictError);
		}
	}
}
