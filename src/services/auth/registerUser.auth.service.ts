import pool from '../../config/db';
import bcrypt from 'bcryptjs';
import { GET_ALL_USER_DETAILS_BY_EMAIL } from '../../providers/commonQueries.providers';

export default async function registerUserToDatabase(request: string[]) {
	// const conn = await pool.connect();

	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(request[2]!, salt);

		const detailsToSave = [request[1], hashedPassword];
		const saveToDB = await pool.query(
			'INSERT INTO tbl_users(email,password_hash) VALUES ($1, $2) RETURNING id',
			detailsToSave
		);

		if (!saveToDB) {
			throw new Error('Something went wrong while trying to register the user.');
		} else {
			const usernameArray = request[0]!.split(' ');
			const filteredUsernameArray = usernameArray.filter((word) => word.length >= 1);

			const firstName = filteredUsernameArray[0];
			const lastName = filteredUsernameArray[filteredUsernameArray.length - 1];

			const userDetailsToSave = [saveToDB.rows[0].id, firstName, lastName];
			await pool.query(
				`INSERT INTO tbl_users_details(users_id,first_name,last_name) VALUES ($1, $2, $3) RETURNING id`,
				userDetailsToSave
			);

			const credentialsCheck = await pool.query(GET_ALL_USER_DETAILS_BY_EMAIL, [request[1]]);

			return credentialsCheck.rows[0];
		}
	} catch (err) {
		console.error('Error creating record:', err);
		throw new Error('Error creating record', { cause: err });
	}
	// finally {
	// 	conn.release();
	// }
}
