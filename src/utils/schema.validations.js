import * as z from 'zod';

const passwordSchema = z
	.string()
	.min(8, { message: 'Password must be at least 8 characters' })
	.max(36, { message: 'Password must be at most 36 characters' })
	.refine((password) => /[A-Z]/.test(password), {
		message: 'Password must contain at least one uppercase letter',
	})
	.refine((password) => /[a-z]/.test(password), {
		message: 'Password must contain at least one lowercase letter',
	})
	.refine((password) => /[0-9]/.test(password), {
		message: 'Password must contain at least one number',
	})
	// .refine((password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), {
	.refine((password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password), {
		message: `Password must contain at least one special character from the following: !@#$%^&*()_+={};:'"|,.<>?`,
	});

const OTPSchema = z
	.string()
	.length(6, { message: "OTP must be 6 digits long" })
	.regex(/^\d+$/, { message: "OTP must only contain numbers" })

export const authRegisterSchema = z
	.object({
		name: z.string().min(4).max(64).trim(),
		email: z.email(),
		// password: z.string().min(8).max(64),
		password: passwordSchema,
		confirmed_password: z.string(),
	})
	.refine((data) => data.password === data.confirmed_password, {
		message: 'Passwords do not match',
		path: ['confirmed_password'],
	});

export const authLoginSchema = z.object({
	email: z.email(),
	password: passwordSchema,
});

export const nameSchema = z.object({
	name: z.string().min(4).max(64).trim(),
});

export const authForgotPasswordSchema = z.object({
	email: z.email(),
});

export const authVerifyOTPSchema = z.object({
	email: z.email(),
	otp: OTPSchema,
});

export const authResetPasswordSchema = z
	.object({
		email: z.email(),
		password: passwordSchema,
		confirmed_password: z.string(),
	}).required()
	.refine((data) => data.password === data.confirmed_password, {
		message: 'Passwords do not match',
		path: ['confirmed_password'],
	}).required();

export const PasswordChangeSchema = z
	.object({
		password: passwordSchema,
		confirmed_password: z.string(),
	}).required()
	.refine((data) => data.password === data.confirmed_password, {
		message: 'Passwords do not match',
		path: ['confirmed_password'],
	}).required();

export const UUIDSchema = z.uuidv7({
	error: (iss) => iss.input === undefined ? "Field is required." : "Incorrect format, please enter a valid UUID"
});

export const userFavoriteProductSchema = z.object({
	users_id: UUIDSchema,
	products_variants_id: UUIDSchema,
});

const extractUuidFromString = (input) => {
	const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
	return match?.[0];
};

export const extractedUuidSchema = z.string()
	.transform((val) => extractUuidFromString(val)) // 1. Extract the potential UUID string
	.pipe(z.uuidv7()); // 2. Pipe the extracted string to the built-in uuid validator

