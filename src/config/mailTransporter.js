import nodemailer from "nodemailer";
import env from 'node:process';

// https://nodemailer.com/
// Create a transporter using SMTP
export const transporter = nodemailer.createTransport({
	host: "localhost",
	port: 1025,
	secure: false, 
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
	tls: {
		// https://nodemailer.com/smtp
		// Accept self-signed or invalid certificates
		rejectUnauthorized: false,
	},
});

export default transporter;