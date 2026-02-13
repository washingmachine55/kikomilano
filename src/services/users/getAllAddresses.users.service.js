import pool from "../../config/db.js"
import { NotFoundError } from "../../utils/errors.js";

export const getAllUserAddresses = async (userId) => {

	const result = await pool.query(`
		SELECT a.id AS address_id, a.address_name, a.address_line
		FROM tbl_users u
		JOIN tbl_users_addresses ua ON u.id = ua.users_id
		JOIN tbl_addresses a ON ua.addresses_id = a.id
		WHERE u.id = $1 AND a.status = 1;
	`, [userId]).catch(err => {
		throw new Error("Unable to fetch user's addresses", { cause: err });
	})

	if ((result.rows.length === 0)) {
		throw new NotFoundError("No addresses found of this user. Create a new address using POST method to see it here later.");
	}

	return {
		addresses_info: result.rows
	}
}