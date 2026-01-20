import transporter from '../../config/mailTransporter.js';
import { getRandomOTP } from '../../utils/getRandomOTP.js';
import pool from "../../config/db.js";
import { formatDistance, formatDate } from "date-fns";
import { TZDate } from "@date-fns/tz";
import env from 'node:process';

export async function sendVerificationEmail(userId) {
	const conn = await pool.getConnection();

	const userOTP = getRandomOTP();
	const currentTimestamp = new Date();
	let expirationTimestamp = new Date();

	const expiration_time = Number(env.OTP_EXPIRATION_TIME)

	expirationTimestamp = new Date(expirationTimestamp.setMinutes(expirationTimestamp.getMinutes() + expiration_time))

	const currentTimestampISO = currentTimestamp.toISOString().replace('T', ' ').replace('Z', '')
	const expirationTimestampISO = expirationTimestamp.toISOString().replace('T', ' ').replace('Z', '')
	// const currentTimestampISO = currentTimestamp.toISOString()
	// const expirationTimestampISO = expirationTimestamp.toISOString()

	const request = [userId, currentTimestampISO]

	try {
		const emailCheck = await conn.query("SELECT CASE WHEN EXISTS(SELECT geo_news.verification_emails.user_id FROM geo_news.verification_emails WHERE user_id = ? AND email_sent = 1 AND ? < expiration_date) THEN 1 ELSE 0 END AS ExistsCheck; ", request);

		let result = emailCheck[0].ExistsCheck.toString();

		if (result == 1) {
			// return false;
			const getExistingEmailDetails = await conn.query("SELECT geo_news.verification_emails.OTP_value, geo_news.verification_emails.expiration_date FROM geo_news.verification_emails WHERE user_id = ? AND email_sent = 1 AND ? < expiration_date; ", request);

			const existingEmailDetails = Object.values(getExistingEmailDetails[0])

			const OTPToResend = existingEmailDetails[0]
			const existingExpirationDateInEmail = existingEmailDetails[1]

			const timeDifferenceForHumans = formatDistance(existingExpirationDateInEmail, currentTimestampISO,
				{
					addSuffix: true,
					includeSeconds: true,
				}
			)

			const ConvertExpirationTimestampToLocal = TZDate.tz("Asia/Karachi", existingExpirationDateInEmail.setHours(existingExpirationDateInEmail.getHours() + 5)).toISOString()

			const formattedExpirationTimestamp = formatDate(ConvertExpirationTimestampToLocal, 'PPPPpp').concat(" PKT")

			await transporter.sendMail({
				from: '"Admin Sender" <test@example.com>',
				to: "recipient@example.com",
				subject: `Verify your Email: User ${userId}`,
				text: "This is a test email sent via Nodemailer",
				html: `<pThis is a <b>test verification email</b> sent via Nodemailer!</p><br/><p>Your OTP is <b>${OTPToResend}</b>, and it expires <b>${timeDifferenceForHumans}</b> on ${formattedExpirationTimestamp}</p>`,
			});

			return true;

		} else if (result == 0) {

			const timeDifferenceForHumans = formatDistance(expirationTimestampISO, currentTimestampISO,
				{
					addSuffix: true,
					includeSeconds: true,
				}
			)

			const ConvertExpirationTimestampToLocal = TZDate.tz("Asia/Karachi", expirationTimestamp).toISOString().replace('T', ' ').replace('Z', '')

			const formattedExpirationTimestamp = formatDate(ConvertExpirationTimestampToLocal, 'PPPPpp').concat(" PKT")

			// https://nodemailer.com/usage/testing-with-ethereal
			await transporter.sendMail({
				from: '"Admin Sender" <test@example.com>',
				to: "recipient@example.com",
				subject: `Verify your Email: User ${userId}`,
				text: "This is a test email sent via Nodemailer",
				html: `<pThis is a <b>test verification email</b> sent via Nodemailer!</p><br/><p>Your OTP is <b>${userOTP}</b>, and it expires <b>${timeDifferenceForHumans}</b> on ${formattedExpirationTimestamp}</p>`,
			});

			const verificationEmailRequest = [userId, "1", userOTP, expirationTimestampISO, currentTimestampISO]

			const saveToDB = await conn.query("INSERT INTO verification_emails(user_id,email_sent,OTP_value,expiration_date,created_at) VALUES (?, ?, ?, ?, ?)", verificationEmailRequest);
			await saveToDB;

			return true;
		} else {
			return false;
		}

	} catch (error) {
		console.debug(error)
	} finally {
		conn.end()
	}
}

export async function compareValidOTP(userId, userOTP) {
	const conn = await pool.getConnection();
	const currentTimestamp = new Date();
	const currentTimestampISO = currentTimestamp.toISOString().replace('T', ' ').replace('Z', '')

	const request = [userId, currentTimestampISO, userOTP]

	try {
		// const query = await conn.query("SELECT UNIQUE geo_news.verification_emails.OTP_value FROM geo_news.verification_emails WHERE user_id = ? AND email_sent = 1 AND ? < expiration_date AND OTP_value = ?; ", request);
		const query = await conn.query("SELECT CASE WHEN EXISTS(SELECT UNIQUE geo_news.verification_emails.OTP_value FROM geo_news.verification_emails WHERE user_id = ? AND email_sent = 1 AND ? < expiration_date AND OTP_value = ?)THEN 1 ELSE 0 END AS ExistsCheck; ", request);

		// let compareOTP = Object.values(query[0])
		let result = query[0].ExistsCheck.toString();

		// if (Number(compareOTP) == Number(userOTP)) {
		if (result == 1) {
			const saveToDB = conn.query("UPDATE geo_news.users SET is_verified = 1 WHERE id = ?", userId);
			await saveToDB;
			return true;
		} else {
			return false;
		}



	} catch (error) {
		console.debug(error)
	} finally {
		conn.end()
	}
}

export async function userIsVerifiedCheck(userId) {
	const conn = await pool.getConnection();
	try {
		// const query = await conn.query("SELECT is_verified FROM geo_news.users WHERE id = ? AND is_verified = 1; ", userId);
		const query = await conn.query("SELECT CASE WHEN EXISTS(SELECT is_verified FROM geo_news.users WHERE id = ? AND is_verified = 1)THEN 1 ELSE 0 END AS ExistsCheck; ", userId);
		
		// let result = Number(Object.values(query[0]))
		let result = query[0].ExistsCheck.toString();
		

		if (Number(result) == 1) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		console.debug(error)
	} finally {
		conn.end()
	}
}
