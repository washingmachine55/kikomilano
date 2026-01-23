import express from 'express'
import cors from 'cors'
import compression from 'compression';
import multer from 'multer';
import { env, loadEnvFile } from 'node:process'

loadEnvFile();
const app = express()

app.set('query parser', 'simple')
app.use(express.json())
app.use(compression())
app.use(express.static('../public'));
app.use(cors({
	origin: '*',
	credentials: false,
}))


import SwaggerUI from 'swagger-ui-express'
import swaggerDocument from './config/swagger_output.json' with { type: 'json' };
app.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(swaggerDocument));

import authRoutes from "./routes/auth.routes.js"
app.use("/auth", authRoutes)

import usersRoutes from "./routes/users.routes.js"
app.use("/users", usersRoutes)

import { responseWithStatus } from './utils/RESPONSES.js';
app.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return responseWithStatus(res, 0, 413, `File is too large. Maximum size is ${Number(env.UPLOAD_FILE_MAX_SIZE) / (1000 * 1000)} MB.`, err.message)
		}
		return responseWithStatus(res, 0, 400, err.message)
	} else if (err) {
		return responseWithStatus(res, 0, 415, "Form field does not satisfy requirement. Please enter the correct field name for uploading the file.", { "error_details": err.message })
	}
	next(err);
});

app.use((req, res) => {
	res.status(404).json({
		status: 404,
		message: 'Page not found. Use the default root endpoint for a guide on available APIs.',
	});
});


// ------------------------------------------------------------------------
// App Initialization
export const server = app.listen(env.APP_PORT, () => {
	console.log(`${env.APP_NAME} listening on port ${env.APP_PORT}`)
})

server.keepAliveTimeout = Number(env.APP_KEEP_ALIVE_TIMEOUT);
server.headersTimeout = Number(env.APP_HEADERS_TIMEOUT);


export default app;