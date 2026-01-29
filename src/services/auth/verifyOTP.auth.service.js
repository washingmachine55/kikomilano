import { TZDate } from '@date-fns/tz';
import pool from '../../config/db.js';
export async function verifyOTPFromDB(userEmail, userOTP) {
	const conn = await pool.connect();

	try {
		const emailCheck = await conn.query(
			'SELECT CASE WHEN EXISTS(SELECT email FROM tbl_users WHERE email = $1) THEN 1 ELSE 0 END AS ExistsCheck;',
			[userEmail]
		);
		let emailCheckResult = emailCheck.rows[0].existscheck.toString();
		if (emailCheckResult == 0) {
			return false;
		} else {
			let currentTimestamp = new Date();
			const currentTimestampISO = currentTimestamp.toISOString().replace('T', ' ').replace('Z', '')
			// FOR TESTING, REMOVE LATER
			if (userOTP == 112233) {
				return true
			}

			const otpCheck = await conn.query(
				`
				SELECT CASE WHEN EXISTS(
				SELECT otp_value
				FROM tbl_users_otp 
				JOIN tbl_users t ON t.id = tbl_users_otp.users_id 
				WHERE otp_value = $1 AND tbl_users_otp.date_expiration > NOW() AT TIME ZONE 'UTC'
				)THEN 1 ELSE 0 END AS ExistsCheck
				;`,
				[userOTP]
			);
			let otpCheckResult = otpCheck.rows[0].existscheck
			if (otpCheckResult == 1) {
				return true
			} else {
				return false;
			}
		}
	} catch (err) {
		console.error('Error checking otp:', err);
	} finally {
		conn.release();
	}
}