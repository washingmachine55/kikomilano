export class ValidationError extends Error {
	constructor(details) {
		super(details); // Call the parent Error constructor
		this.message = 'Validation Error'; // Set a custom name
		this.details = details
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ValidationError);
		}
	}
}

export class ConflictError extends Error {
	constructor(details) {
		super(details); // Call the parent Error constructor
		this.message = 'Conflicting Record Error'; // Set a custom name
		this.details = details
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConflictError);
		}
	}
}

export class NotFoundError extends Error {
	constructor(details) {
		super(details); // Call the parent Error constructor
		this.message = 'Entity not found'; // Set a custom name
		this.details = details
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConflictError);
		}
	}
}