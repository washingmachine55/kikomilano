import pool from "../../config/db.js";
import { RecordCheck } from "../../providers/recordChecks.providers.js";
import { NotFoundError, trialCapture } from "../../utils/errors.js";
import { nameSplitter } from "../../utils/nameSplitter.js";
import saveNewUserPasswordToDB from "../auth/saveNewPassword.auth.service.js";

export const editUserDetails = async (fieldsToUpdate, verifiedUserId) => {
	const conn = await pool.connect();

	const emailUpdateArr = []
	const nameUpdateArr = []

	const namePassUpdateArr = []
	const emailNameUpdateArr = []
	const emailPassUpdateArr = []

	const emailPassNameUpdateArr = []

	if (fieldsToUpdate.hasOwnProperty("email")) {
		const [data, error] = await trialCapture(
			new RecordCheck("email", "tbl_users", fieldsToUpdate.email).getResult()
		)
		if (error) {
			throw new Error("Something went wrong while trying to check if email exists", { cause: error });
		}
		if (data === false) {
			const [emailUpdate, error] = await trialCapture(await conn.query(
				`UPDATE tbl_users SET email = $1, updated_at = NOW(), updated_by = $2 WHERE id = $2 RETURNING id, email, phone_no, access_type, created_at, updated_at`,
				[fieldsToUpdate.email, verifiedUserId]
			));
			if (error) {
				throw new NotFoundError("Unable to find user in database");
			}
			emailUpdateArr.push(emailUpdate.rows[0])
		}
	}

	if (fieldsToUpdate.hasOwnProperty("name")) {
		const nameArr = await nameSplitter(fieldsToUpdate.name)
		const userDetailsToSave = [nameArr[0], nameArr[1], verifiedUserId];
		const [nameCheck, errorNameCheck] = await trialCapture(await conn.query(`
			SELECT CASE WHEN EXISTS (SELECT  
			FROM tbl_users u
			JOIN tbl_users_details ud ON u.id = ud.users_id
			WHERE users_id = $3 AND first_name = $1 AND last_name = $2) THEN true ELSE false END AS ExistsCheck;
			`, [nameArr[0], nameArr[1], verifiedUserId]));
		if (errorNameCheck) {
			throw new Error("Error checking name from database", {cause: errorNameCheck});
		}

		if (nameCheck.rows[0].existscheck === false) {
			const [nameUpdate, errorNameUpdate] = await trialCapture(await conn.query(
				`UPDATE tbl_users_details SET first_name = $1, last_name = $2, updated_at = NOW(), updated_by = $3 WHERE users_id = $3 RETURNING users_id, first_name, last_name, created_at, updated_at`,
				userDetailsToSave
			));
			if (errorNameUpdate) {
				throw new Error("Unable to save name changes in database", { cause: errorNameUpdate });
			}
			nameUpdateArr.push(nameUpdate.rows[0])
		}
	}

	if (fieldsToUpdate.hasOwnProperty("email") && fieldsToUpdate.hasOwnProperty("password")) {
		const [emailPass, errorEmailPass] = await trialCapture(
			await saveNewUserPasswordToDB(fieldsToUpdate.email, fieldsToUpdate.password)
		)
		if (errorEmailPass) {
			throw new Error("Error updating user's password to database", { cause: errorEmailPass });
		}
		emailPassUpdateArr.push(emailPass)
	}
	// TOFIX: add all into one array as one basic object reagardless of what is updated
	return {
		emailPassUpdates: emailPassUpdateArr,
		nameUpdates: nameUpdateArr,
		emailUpdates: emailUpdateArr,
	}

	conn.release();
}