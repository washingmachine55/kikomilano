import pool from "../../config/db.js"
import { trialCapture, UnprocessableContentError } from "../../utils/errors.js";

export const saveAddress = async (addressName, addressInfo, userId) => {
	const conn = await pool.connect()

	await conn.query("BEGIN");

	const [queryAddress, queryAddressError] = await trialCapture(await conn.query('INSERT INTO tbl_addresses (address_name, address_line, created_by) VALUES ($1,$2,$3) RETURNING id', [addressName, addressInfo, userId]).catch(err => {
		throw new UnprocessableContentError(err.message);
	}))

	const [queryUsers, queryUsersError] = await trialCapture(await conn.query('UPDATE tbl_users_details SET addresses_id = $1 WHERE users_id = $2 RETURNING *', [queryAddress.rows[0].id, userId]).catch(err => {
		throw new UnprocessableContentError(err.message);
	}))

	await conn.query("COMMIT");

	console.log(queryAddressError);


	if (queryUsersError || queryAddressError) {
		await conn.query("ROLLBACK");
		conn.release()
		throw new Error("Something went wrong while trying to save the user's address");
	} else {
		const result = await conn.query(`
			SELECT u.id, u.email, u.phone_no, u.access_type, ud.first_name, ud.last_name, i.image_url, ad.address_name, ad.address_line
			FROM tbl_users u 
			JOIN tbl_users_details ud ON u.id = ud.users_id
			JOIN tbl_addresses ad ON ud.addresses_id = ad.id
			FULL JOIN tbl_images i ON i.id = ud.images_id
			WHERE u.id = $1; 
		`, [userId])
		
		conn.release()
		return result.rows[0]
	}

}