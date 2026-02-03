export const attempt = async (func) => {
	return (res, req, next) => {
		func(res, req, next).catch((err) => next(err));
	}
}

export const trialCapture = async (promise) => {
	try {
		const result = await promise
		return [result, null]
	} catch (error) {
		console.log(error);
		return [null, error]
	}
}

export class ValidationError extends Error {
	constructor(message) {
		super(message); // Call the parent Error constructor
		this.name = 'Validation Error'; // Set a custom name
		this.message = message;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ValidationError);
		}
	}
}

export class BadRequestError extends Error {
	constructor(message) {
		super(message); // Call the parent Error constructor
		this.name = 'Bad Request Error'; // Set a custom name
		this.message = message;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ValidationError);
		}
	}
}

export class ConflictError extends Error {
	constructor(details) {
		super(details); // Call the parent Error constructor
		this.name = 'Conflicting Record Error'; // Set a custom name
		this.details = details
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConflictError);
		}
	}
}

export class NotFoundError extends Error {
	constructor(message, details) {
		super(message); // Call the parent Error constructor
		this.name = 'Entity not found'; // Set a custom name
		this.message = message
		this.cause = details
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConflictError);
		}
	}
}