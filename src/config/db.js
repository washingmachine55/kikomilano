import { Pool } from 'pg';
import { loadEnvFile } from 'node:process';

loadEnvFile();

const pool = new Pool({
	// host: process.env.PGHOST, // The service name, not 'localhost'
	// port: Number(process.env.PGPORT),
	// user: process.env.PGUSER,
	// password: process.env.PGPASSWORD,
	// database: process.env.PGDATABASE,
	max: 200,
	idleTimeoutMillis: 10000,
	connectionTimeoutMillis: 2000,
	maxLifetimeSeconds: 60,
});



export default pool;
