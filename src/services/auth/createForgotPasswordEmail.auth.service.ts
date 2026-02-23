import pool from '../../config/db';

import { TZDate } from '@date-fns/tz';
import { formatDate, formatDistance } from 'date-fns';
import transporter from '../../config/mailTransporter.ts';
import { getRandomOTP } from '../../utils/getRandomOTP.ts';
import { GET_USER_ID_FROM_EMAIL } from '../../providers/commonQueries.providers';

export async function createForgotPasswordEmail(userEmail) {
	const currentTimestamp = new Date();
	let expirationTimestamp = new Date();
	const expiration_time = Number(process.env.OTP_EXPIRATION_TIME);
	expirationTimestamp = new Date(expirationTimestamp.setMinutes(expirationTimestamp.getMinutes() + expiration_time));

	const currentTimestampISO = currentTimestamp.toISOString().replace('T', ' ').replace('Z', '');
	const expirationTimestampISO = expirationTimestamp.toISOString().replace('T', ' ').replace('Z', '');
	const timeDifferenceForHumans = formatDistance(expirationTimestampISO, currentTimestampISO, {
		addSuffix: true,
		includeSeconds: true,
	});

	const ConvertExpirationTimestampToLocal = TZDate.tz(
		process.env.CURRENT_TZ,
		expirationTimestamp
	).internal.toISOString();
	const formattedExpirationTimestamp = formatDate(ConvertExpirationTimestampToLocal, 'PPPPpp').concat(' PKT');

	const otp = getRandomOTP();

	const getUserIdFromEmail = await pool.query(GET_USER_ID_FROM_EMAIL, [userEmail]);
	const userId = getUserIdFromEmail.rows[0].id;

	const otpCheck = await pool.query(
		`
			SELECT CASE WHEN EXISTS(
			SELECT otp_value
			FROM tbl_users_otp
			JOIN tbl_users t ON t.id = tbl_users_otp.users_id
			WHERE users_id = $1 AND tbl_users_otp.date_expiration > NOW() AT TIME ZONE 'UTC'
			)THEN true ELSE false END AS ExistsCheck
			;`,
		[userId]
	);
	const otpCheckResult = otpCheck.rows[0].existscheck;

	if (otpCheckResult === true) {
		const getUnexpiredOTPEmailDetails = await pool.query(
			'SELECT otp_value, date_sent, date_expiration from tbl_users_otp WHERE users_id = $1;',
			[userId]
		);
		const unexpiredOTPDate = TZDate.tz(
			process.env.CURRENT_TZ,
			getUnexpiredOTPEmailDetails.rows[0].date_expiration
		).internal.toISOString();
		const formattedUnexpiredTimestamp = formatDate(unexpiredOTPDate, 'PPPPpp').concat(' PKT');

		const unexpiredTimeDifferenceForHumans = formatDistance(
			unexpiredOTPDate,
			TZDate.tz(process.env.CURRENT_TZ, currentTimestampISO).internal.toISOString(),
			{
				addSuffix: true,
				includeSeconds: true,
			}
		);

		await transporter
			.sendMail({
				from: '"Admin Sender" <test@example.com>',
				// to: process.env.NODE_ENV === 'dev' ? process.env.SMTP_USER : userEmail,
				to: userEmail,
				// to: process.env.SMTP_USER,
				subject: `Verify your Email: User ${userId}`,
				text: 'This is a test email sent via Nodemailer',
				html: `
			<p>This is a <b>test verification email</b> sent via Nodemailer!</p>
			<br/>
				<p>
					Please enter the following OTP in the App to reset your password: 
					<b>${getUnexpiredOTPEmailDetails.rows[0].otp_value}</b>
				</p>
			<br/>
			<p>The OTP expires <b>${unexpiredTimeDifferenceForHumans}</b> on ${formattedUnexpiredTimestamp}</p>`,
			})
			.catch((err) => {
				throw new Error(err);
			});
	} else {
		try {
			const emailResult = await pool.query(
				'INSERT INTO tbl_users_otp(users_id,otp_value,date_sent,date_expiration) VALUES ($1,$2,$3,$4);',
				[userId, otp, currentTimestampISO, expirationTimestampISO]
			);

			await transporter
				.sendMail({
					from: '"Admin Sender" <test@example.com>',
					// to: process.env.NODE_ENV === 'dev' ? process.env.SMTP_USER : userEmail,
					to: userEmail,
					// to: process.env.SMTP_USER,
					subject: `Verify your Email: User ${userId}`,
					text: 'This is a test email sent via Nodemailer',
					html: `
			<p>This is a <b>test verification email</b> sent via Nodemailer!</p>
			<br/>
				<p>
					Please enter the following OTP in the App to reset your password: 
					<b>${otp}</b>
				</p>
			<br/>
			<p>The OTP expires <b>${timeDifferenceForHumans}</b> on ${formattedExpirationTimestamp}</p>`,
				})
				.catch((err) => {
					throw new Error(err);
				});
			return emailResult;
		} catch (error) {
			console.debug(error);
		}
	}
}
