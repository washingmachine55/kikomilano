import nodemailer from 'nodemailer';
import { loadEnvFile } from 'node:process';
loadEnvFile();

// https://nodemailer.com/
// Create a transporter using SMTP
// export const transporter = async () => {
export const transporter = nodemailer.createTransport({
	pool: true,
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
	tls: {
		// https://nodemailer.com/smtp
		// Accept self-signed or invalid certificates
		rejectUnauthorized: false,
	},
});

export default transporter;
