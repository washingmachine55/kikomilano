import express from 'express'
import cors from 'cors'
import compression from 'compression';
import { env, loadEnvFile } from 'node:process'

import SwaggerUI from 'swagger-ui-express'
// import { swaggerSpec } from './config/swagger.js';
import swaggerDocument from './config/swagger_output.json' with { type: 'json' }; 

loadEnvFile();
const app = express()
const port = 3333

app.use(express.json())
app.use(compression())

app.use(cors({
	origin: '*',
	credentials: false,
}))

app.set('query parser', 'simple')

import authRoutes from "./routes/auth.routes.js"
app.use("/auth", authRoutes)

app.get("/", (req, res) => {
	res.json({
		app_name: `${env.APP_NAME}`,
		api_endpoints_available: {
			authentication: {
				register: {
					endpoint:"/auth/register",
					method: "POST",
				}
			}
		}
		// url_query_parameter_defaults: {
		// 	limit: '10',
		// 	orderby: 'id',
		// 	offset: '0',
		// 	sort: 'ASC'
		// }
	});
})

// app.use((req, res) => {
// 	res.status(404).json({
// 		status: 404,
// 		message: 'Page not found. Use the default root endpoint for a guide on available APIs.',
// 	});
// });

app.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(swaggerDocument));

app.listen(port, () => {
	console.log(`${env.APP_NAME} listening on port ${port}`)
})
