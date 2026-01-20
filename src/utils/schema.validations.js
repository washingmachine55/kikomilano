import * as z from "zod";

export const authRegisterSchema = z.object({
	name: z.string().min(4).max(64).trim(),
	email: z.email(),
	password: z.string().min(8).max(64),
	confirmed_password: z.string(),
}).refine((data) => data.password === data.confirmed_password, {
	message: "Passwords do not match",
	path: ["confirmed_password"],
});