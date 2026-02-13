import pool from '../../config/db.js';
import { readTextFile } from '../../utils/readFile.js';

(async () => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		await client.query(`
			${await readTextFile(process.env.TRUNCATE_DATABASE_FILE_PATH)}
		`);

		await client.query('COMMIT');
		console.log('✅ Migration Freshened successfully');
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('❌ Migration failed:', err);
	} finally {
		client.release();
		process.exit();
	}
})();
