// import { TZDate } from '@date-fns/tz';
import pool from '../../config/db';
import { CASE_EMAIL_CHECK } from '../../providers/commonQueries.providers';
export async function verifyOTPFromDB(userEmail: string, userOTP: number) {
	// const conn = await pool.connect();

	try {
		const emailCheck = await pool.query(CASE_EMAIL_CHECK, [userEmail]);
		let emailCheckResult = emailCheck.rows[0].existscheck;
		if (emailCheckResult === false) {
			return false;
		} else {
			// let currentTimestamp = new Date();
			// const currentTimestampISO = currentTimestamp.toISOString().replace('T', ' ').replace('Z', '');
			// FOR TESTING, REMOVE LATER
			if (userOTP == 112233) {
				return true;
			}

			const otpCheck = await pool.query(
				`
				SELECT CASE WHEN EXISTS(
				SELECT otp_value
				FROM tbl_users_otp 
				JOIN tbl_users t ON t.id = tbl_users_otp.users_id 
				WHERE otp_value = $1 AND tbl_users_otp.date_expiration > NOW() AT TIME ZONE 'UTC'
				)THEN true ELSE false END AS ExistsCheck
				;`,
				[userOTP]
			);
			const otpCheckResult = otpCheck.rows[0].existscheck;
			if (otpCheckResult === true) {
				return true;
			} else {
				return false;
			}
		}
	} catch (err) {
		console.error('Error checking otp:', err);
		throw new Error('Error checking otp', { cause: err });
	}
	// finally {
	// 	conn.release();
	// }
}
