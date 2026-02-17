import app from './app.js';

import { env, loadEnvFile } from 'node:process';
import transporter from './config/mailTransporter.js';
loadEnvFile();

// ======================================================================
// ======================  App Initialization  ==========================
// ======================================================================
export const server = app.listen(env.APP_PORT, () => {
	if (env.NODE_ENV == 'dev') {
		console.log(`${env.APP_NAME} listening on port ${env.APP_PORT}`);
	}
});

if (process.env.NODE_ENV === 'dev') {
	try {
		await transporter.verify();
		console.log("Server is ready to take our mail messages");
	} catch (err) {
		console.error("Verification failed", err);
	}
} 

process.on('SIGTERM', () => {
	console.debug('SIGTERM signal received: closing HTTP server')
	server.close(() => {
		console.debug('HTTP server closed')
	})
});

server.keepAliveTimeout = Number(env.APP_KEEP_ALIVE_TIMEOUT);
server.headersTimeout = Number(env.APP_HEADERS_TIMEOUT);