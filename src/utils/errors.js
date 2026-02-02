export const attempt = async (func) => {
	return (res, req, next) => {
		func(res, req, next).catch(err => next(err));
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