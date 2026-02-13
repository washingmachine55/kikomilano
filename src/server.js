import app from './app.js';

import { env, loadEnvFile } from 'node:process';
loadEnvFile();

// ======================================================================
// ======================  App Initialization  ==========================
// ======================================================================
export const server = app.listen(env.APP_PORT, () => {
	if (env.NODE_ENV == 'dev') {
		console.log(`${env.APP_NAME} listening on port ${env.APP_PORT}`);
	}
});

server.keepAliveTimeout = Number(env.APP_KEEP_ALIVE_TIMEOUT);
server.headersTimeout = Number(env.APP_HEADERS_TIMEOUT);