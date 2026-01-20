import { Pool } from 'pg'
import { loadEnvFile } from 'node:process'

loadEnvFile();

const pool = new Pool({
	max: 20,
	idleTimeoutMillis: 10000,
	connectionTimeoutMillis: 2000,
	maxLifetimeSeconds: 60
});

export default pool;