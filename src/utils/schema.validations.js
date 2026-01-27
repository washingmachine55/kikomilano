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
	password: z.string().min(8).max(36),
});

export const authForgotPasswordSchema = z.object({
	email: z.email(),
});
