import pool from '../../config/db.ts';
import { TRUNCATE_DATABASE_FILE_PATH } from '../../config/env-config.ts';
import { readTextFile } from '../../utils/readFile.ts';

(async () => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		await client.query(`
			${await readTextFile(TRUNCATE_DATABASE_FILE_PATH)}
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
