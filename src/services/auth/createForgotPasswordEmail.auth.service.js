import pool from '../../config/db.js';

import { TZDate } from "@date-fns/tz";
import { formatDate, formatDistance } from "date-fns";
import transporter from "../../config/mailTransporter.js";
import { getRandomOTP } from "../../utils/getRandomOTP.js";

export async function createForgotPasswordEmail(userId, userEmail) {
	const conn = await pool.connect();

	const currentTimestamp = new Date();
	let expirationTimestamp = new Date();
	const expiration_time = Number(process.env.OTP_EXPIRATION_TIME)
	expirationTimestamp = new Date(expirationTimestamp.setMinutes(expirationTimestamp.getMinutes() + expiration_time))

	const currentTimestampISO = currentTimestamp.toISOString().replace('T', ' ').replace('Z', '')
	const expirationTimestampISO = expirationTimestamp.toISOString().replace('T', ' ').replace('Z', '')
	const timeDifferenceForHumans = formatDistance(expirationTimestampISO, currentTimestampISO,
		{
			addSuffix: true,
			includeSeconds: true,
		}
	)

	const ConvertExpirationTimestampToLocal = TZDate.tz("Asia/Karachi", expirationTimestamp).toISOString()
	const formattedExpirationTimestamp = formatDate(ConvertExpirationTimestampToLocal, 'PPPPpp').concat(" PKT")

	const otp = getRandomOTP();

	try {
		try {
			await conn.query('INSERT INTO tbl_users_otp(users_id,otp_value,date_sent,date_expiration) VALUES ($1,$2,$3,$4);', [userId, otp, currentTimestampISO, expirationTimestampISO]);
		} catch (error) {
			console.debug(error)
		}

		await transporter.sendMail({
			from: '"Admin Sender" <test@example.com>',
			// to: userEmail,
			to: process.env.SMTP_USER,
			subject: `Verify your Email: User ${userId}`,
			text: "This is a test email sent via Nodemailer",
			html: `
			<p>This is a <b>test verification email</b> sent via Nodemailer!</p>
			<br/>
				<p>
					Please enter the following OTP in the App to reset your password: 
					<b>${otp}</b>
				</p>
			<br/>
			<p>The OTP expires <b>${timeDifferenceForHumans}</b> on ${formattedExpirationTimestamp}</p>`,
		});
		
	} catch (error) {
		console.debug(error)
	} finally {
		conn.release();
	}

}