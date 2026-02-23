import pool from "../../config/db.js"
import { ConflictError, trialCapture, UnprocessableContentError } from "../../utils/errors.js";

export const saveAddress = async (addressName: string, addressInfo: string, userId: string) => {
	const conn = await pool.connect()

	const userAddressesCountCheckQuery = await pool.query('SELeCT COUNT(users_id) FROM tbl_users_addresses WHERE users_id = $1', [userId])
	const userAddressesCountCheck = Number(userAddressesCountCheckQuery.rows[0].count)

	const userAddressesContentCheckQuery = await pool.query(`
	SELECT CASE WHEN EXISTS(
		SELECT * 
		FROM tbl_users u
		JOIN tbl_users_addresses ua ON u.id = ua.users_id
		JOIN tbl_addresses a ON ua.addresses_id = a.id
		WHERE u.id = $1
		AND a.address_name = $2
		AND a.address_line = $3
	) THEN true ELSE false END AS existscheck;
	`, [userId, addressName, addressInfo])
	const userAddressesContentCheck = userAddressesContentCheckQuery.rows[0].existscheck

	if (userAddressesContentCheck === true) {
		throw new ConflictError("A similar address already exists. Please change values to create another one.");
	} else if (userAddressesCountCheck >= 2) {
		throw new UnprocessableContentError("User can not create more than 2 addresses. Please delete one to create another.");
	} else {
		await conn.query("BEGIN");
		const [queryAddress, queryAddressError] = await trialCapture(await conn.query('INSERT INTO tbl_addresses (address_name, address_line, created_by) VALUES ($1,$2,$3) RETURNING id', [addressName, addressInfo, userId]).catch(err => {
			throw new UnprocessableContentError(err.message);
		}))

		// const [queryUsers, queryUsersError] = await trialCapture(await conn.query('UPDATE tbl_users_details SET addresses_id = $1 WHERE users_id = $2 RETURNING *', [queryAddress.rows[0].id, userId]).catch(err => {
		// 	throw new UnprocessableContentError(err.message);
		// }))
		const [queryUsers, queryUsersError] = await trialCapture(await conn.query('INSERT INTO tbl_users_addresses (addresses_id, users_id) VALUES ($1,$2) RETURNING *', [queryAddress.rows[0].id, userId]).catch(err => {
			console.debug(err);
			throw new UnprocessableContentError(err.message);
		}))

		await conn.query("COMMIT");

		if (queryUsersError || queryAddressError) {
			await conn.query("ROLLBACK");
			conn.release()
			throw new Error("Something went wrong while trying to save the user's address");
		} else {
			const result = await conn.query(`
			SELECT u.id, u.email, u.phone_no, u.access_type, ud.first_name, ud.last_name, i.image_url, ad.address_name, ad.address_line
			FROM tbl_users u 
			JOIN tbl_users_details ud ON u.id = ud.users_id
			JOIN tbl_users_addresses ua ON u.id = ua.users_id
			JOIN tbl_addresses ad ON ua.addresses_id = ad.id
			FULL JOIN tbl_images i ON i.id = ud.images_id
			WHERE u.id = $1; 
		`, [userId])
			conn.release()
			return result.rows[0]
		}
	}
}