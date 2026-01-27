import nodemailer from 'nodemailer';

// https://nodemailer.com/
// Create a transporter using SMTP
export const transporter = nodemailer.createTransport({
	host: 'localhost',
	port: 1025,
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
