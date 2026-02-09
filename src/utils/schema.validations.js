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

export const passwordConfirmationSchema = z
	.object({
		password: passwordSchema,
		confirmed_password: z.string(),
	})
	.refine((data) => data.password === data.confirmed_password, {
		message: 'Passwords do not match',
		path: ['confirmed_password'],
	});

const OTPSchema = z
	.string()
	.length(6, { message: 'OTP must be 6 digits long' })
	.regex(/^\d+$/, { message: 'OTP must only contain numbers' });

export const emailSchema = z.email();
export const nameSchema = z.string().min(4).max(64).trim();

export const authRegisterSchema = z
	.strictObject({
		name: nameSchema,
		email: emailSchema,
		password: passwordSchema,
		confirmed_password: z.string(),
	})
	.refine((data) => data.password === data.confirmed_password, {
		message: 'Passwords do not match',
		path: ['confirmed_password'],
	});

export const authLoginSchema = z.strictObject({
	email: emailSchema,
	password: passwordSchema,
});

export const authVerifyOTPSchema = z.object({
	email: emailSchema,
	otp: OTPSchema,
});

export const authResetPasswordSchema = z.strictObject({
	email: emailSchema,
	...passwordConfirmationSchema.shape,
});

export const UUIDSchema = z.uuidv7({
	error: (iss) => (iss.input === undefined ? 'Field is required.' : 'Incorrect format, please enter a valid UUID'),
});

const extractUuidFromString = (input) => {
	const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
	return match?.[0];
};

export const extractedUuidSchema = z
	.string()
	.transform((val) => extractUuidFromString(val)) // 1. Extract the potential UUID string
	.pipe(z.uuidv7()); // 2. Pipe the extracted string to the built-in uuid validator

// =================================================================
// ============		JSON SCHEMAS FOR REQUESTS		  ==============
// =================================================================

// ========================= New Orders ============================
const productsInOrder = z
	.strictObject({
		products_variants_id: UUIDSchema,
		qty: z.coerce
			.number('Quantity: Must be a valid number.')
			.max(20, 'Quantity: Item count must be 20 or less')
			.min(1, 'Quantity: You must have at least one item in cart to continue'),
	})
	.required();

export const ordersNewJsonSchema = z
	.object({
		products: z
			.array(productsInOrder)
			.min(1, 'Products: Must have at least one item in cart to proceed with the order')
			.max(10, 'Products: You cant order more than 10 products in a given order'),
		cart_total: z.coerce
			.number('Cart Total: Must be a valid number')
			.max(9999, 'Cart Total: Total price can not exceed 9999'),
		discount_code: z.string('Discount code: Must be exactly 8 characters').min(8).max(8).optional().nullable(),
		checkout_complete: z.coerce.boolean().optional(),
	})
	.partial({ discount_code: true, checkout_complete: true });

// ==================== User Profile Edit ==========================
export const userProfileEditJsonSchema = z
	.strictObject({
		name: nameSchema.optional(),
		email: emailSchema.optional(),
		...passwordConfirmationSchema.shape,
	})
	.partial({
		password: true,
		confirmed_password: true,
	})
	.refine((data) => data.password === data.confirmed_password, {
		message: 'Passwords do not match',
		path: ['confirmed_password'],
	})
	.superRefine((data, ctx) => {
		if (data.password !== undefined && data.password !== null && data.password !== '') {
			if (
				data.confirmed_password === undefined ||
				data.confirmed_password === null ||
				data.confirmed_password === ''
			) {
				ctx.addIssue({
					code: 'fields_together_stronger',
					path: ['confirmed_password'], // Target the specific field
					message: 'confirmed_password is required when password is provided.',
				});
			}
		}
	});

// ===================== User Set Favorite =========================
export const userFavoriteProductSchema = z
	.strictObject({
		users_id: UUIDSchema,
		products_variants_id: UUIDSchema,
	})
	.partial({ users_id: true });

// ====================	ADDRESSES TABLE SCHEMAS ====================
const addressesBaseSchema = z.object({
	address_name: z.string().max(10).nullable(),
	street_num: z.string().max(8).nullable(),
	street_addr: z.string().max(100).nullable(),
	street_addr_line_2: z.string().max(100).nullable(),
	city: z.string().max(35).nullable(),
	region: z.string().max(25).nullable(),
	zip_code: z
		.string()
		.length(5)
		.regex(/^\d{5}$/)
		.nullable(),
	status: z.number().int().min(0).max(1),
});

export const addressesCreateSchema = addressesBaseSchema.omit({ status: true }).partial();
export const addressesUpdateSchema = addressesBaseSchema.partial();
