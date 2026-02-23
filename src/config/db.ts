import { Pool } from 'pg';
import { PGDATABASE, PGHOST, PGPASSWORD, PGPORT, PGUSER } from './env-config.ts';

const pool = new Pool({
	host: PGHOST, // The service name, not 'localhost'
	port: Number(PGPORT),
	user: PGUSER,
	password: PGPASSWORD,
	database: PGDATABASE,
	max: 200,
	idleTimeoutMillis: 10000,
	connectionTimeoutMillis: 2000,
	maxLifetimeSeconds: 60,
});



export default pool;
