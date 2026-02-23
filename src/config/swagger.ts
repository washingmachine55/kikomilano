import swaggerJsdoc from 'swagger-jsdoc';
import packageJson from '../../package.json' with { type: 'json' };
import { APP_NAME, BASE_URL } from './env-config.ts';

const options = {
	definition: {
		openapi: '3.1.0',
		info: {
			version: `${packageJson.version}`,
			title: `${APP_NAME} - API Documentation`,
			description: 'Documentation for the available API endpoints',
		},
		servers: [
			{
				url: "https://kikomilano.devmindsstudio.co",
				description: "Staging server"
			},
			{
				url: "http://localhost:3000",
				description: "Local server"
			}
		],
		host: BASE_URL,
		basePath: '/',
		schemes: ['http', 'https'],
		consumes: ['application/json'],
		produces: ['application/json'],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		tags: [
			{
				name: 'Authentication',
				description: 'User authentication and authorization endpoints',
			},
			{
				name: 'Users',
				description: 'User related endpoints',
			},
			{
				name: 'Products',
				description: 'Product related endpoints',
			},
			{
				name: 'Orders',
				description: 'Order related endpoints',
			},
		],
	},
	apis: ['./src/routes/**.ts', '../app.ts'],
};

export const openapiSpecification = swaggerJsdoc(options);
