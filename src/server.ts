import app from './app.js';
import * as envVars from './config/env-config.js';
import transporter from './config/mailTransporter.js';

// ======================================================================
// ======================  App Initialization  ==========================
// ======================================================================
export const server = app.listen(envVars['APP_PORT'], () => {
	if (envVars['NODE_ENV'] === 'dev') {
		console.log(`${envVars['APP_NAME']} listening on port ${envVars['APP_PORT']}`);
	}
});

if (envVars['NODE_ENV'] === 'dev') {
	try {
		await transporter.verify();
		console.log('Server is ready to take our mail messages');
	} catch (err) {
		console.error('Verification failed', err);
	}
}

process.on('SIGTERM', () => {
	console.debug('SIGTERM signal received: closing HTTP server');
	server.close(() => {
		console.debug('HTTP server closed');
	});
});

server.keepAliveTimeout = Number(envVars['APP_KEEP_ALIVE_TIMEOUT']);
server.headersTimeout = Number(envVars['APP_HEADERS_TIMEOUT']);