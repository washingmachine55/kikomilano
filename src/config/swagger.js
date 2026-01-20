// import swaggerJSDoc from "swagger-jsdoc";
// import swaggerUi from "swagger-ui-express";

// const options = {
// 	definition: {
// 		openapi: "3.0.0",
// 		info: {
// 			title: "Campaigns In Node + PostgreSQL API",
// 			version: "1.0.0",
// 			description: "Campaigns System API Documentation",
// 		},
// 		// components: {
// 		// 	securitySchemes: {
// 		// 		BearerAuth: {
// 		// 			type: "http",
// 		// 			scheme: "bearer",
// 		// 			bearerFormat: "JWT",
// 		// 		},
// 		// 	},
// 		// },
// 		security: [
// 			{
// 				BearerAuth: [],
// 			},
// 		],
// 	},

// 	// IMPORTANT — scan ALL js files
// 	apis: ["../routes/*", "../server.js"],
// };

// export const swaggerSpec = swaggerJSDoc(options);

// module.exports = (app, port) => {
// 	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 	console.log(`Swagger Docs running at http://localhost:${port}/api-docs`);
// };

import swaggerAutogen from 'swagger-autogen';
import {env, loadEnvFile} from "process";
loadEnvFile();

const outputFile = './swagger_output.json';
const endpointsFiles = ["../server.js"]; // Point to your main application file or specific route files

	// host: `localhost:${env.PORT || 3000}`,
const doc = {
	swagger: "3.1.0",
	info: {
		version: '1.0.0',
		title: 'Kilomilano Makeup - API Documentation',
		description: 'Documentation for the available API endpoints',
	},
	host: env.BASE_URL,
	schemes: ['http'],
	consumes: ['application/json'], 
	produces: ['application/json'], 
	components: {
		schemas: {
			authSchema: {
				data: {
					$name: 'John Doe',
					$email: 'example@example.com',
					$password: 'secret_password',
					$hashedPassword: 'secret_password'
				}
			}
        }
	},
	tags: [
		{
			name: 'Authentication',
			description: 'User authentication and authorization endpoints'
		},
	]
};

const options = {
	openapi: false,
	autoHeaders: true,
	autoQuery: true,
	autoBody: true
};

swaggerAutogen(outputFile, endpointsFiles, doc, options);