import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from './env-config.js';

// https://nodemailer.com/
// Create a transporter using SMTP
// export const transporter = async () => {
export const transporter = nodemailer.createTransport({
	pool: true,
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	secure: false,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS,
	},
	tls: {
		// https://nodemailer.com/smtp
		// Accept self-signed or invalid certificates
		rejectUnauthorized: false,
	},
});

export default transporter;
