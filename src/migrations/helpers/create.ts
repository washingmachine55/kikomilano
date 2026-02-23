import pool from '@config/db.js';
import { CREATE_DATABASE_FILE_PATH } from '@config/env-config.js';
import { readTextFile } from '../../utils/readFile.js';

(async () => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		await client.query(`
			${await readTextFile(CREATE_DATABASE_FILE_PATH)}
		`);

		await client.query('COMMIT');
		console.log('✅ Tables created successfully');
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('❌ Migration failed:', err);
	} finally {
		client.release();
		process.exit();
	}
})();
