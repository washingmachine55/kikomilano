import pool from '@config/db';

(async () => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		const query = `
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        `;
		await client.query(query);

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
