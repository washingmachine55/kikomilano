// import swaggerAutogen from 'swagger-autogen';
import swaggerJsdoc from 'swagger-jsdoc';
import packageJson from '../../package.json' with { type: 'json' };
import { env, loadEnvFile } from 'process';
loadEnvFile();

const outputFile = '../../swagger_output.json';
const endpointsFiles = ['../app.js']; // Point to your main application file or specific route files

/* const doc = {
	failOnErrors: true,
	openapi: '3.1.0',
	info: {
		version: `${packageJson.version}`,
		title: `${env.APP_NAME} - API Documentation`,
		description: 'Documentation for the available API endpoints',
	},
	host: env.BASE_URL,
	schemes: ['http'],
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
		schemas: {
			registerSchema: {
				data: {
					$name: 'John Doe',
					$email: 'example@example.com',
					$password: 'secret_password',
					$confirmed_password: 'secret_password',
				},
			},
			loginSchema: {
				data: {
					$email: 'example@example.com',
					$password: 'secret_password',
				},
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
		}
		// {
		// 	name: 'Orders',
		// 	description: 'Order related endpoints',
		// },
	],
	apis: ['../server.js'],
}; */
const options = {
	definition: {
		openapi: '3.1.0',
		info: {
			version: `${packageJson.version}`,
			title: `${env.APP_NAME} - API Documentation`,
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
		host: env.BASE_URL,
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
	apis: ['./src/routes/**.js', '../app.js'],
	// apis: ['./src/routes/**.js'],
};

export const openapiSpecification = swaggerJsdoc(options);
