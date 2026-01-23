import request from 'supertest';
import app from '../server.js';

describe('GET /api/users', () => {
	it('should return all users', async () => {
		const response = await request(app).get('/users/');
		expect(response.statusCode).toBe(401);
		expect(Array.isArray(response.body)).toBe(false);
		// You can add more specific assertions about the data structure or content
	});
});

describe('GET /api-docs', () => {
	it('should return API docs', async () => {
		const response = await request(app).get('/api-docs/');
		expect(response.statusCode).toBe(200);
		expect(Array.isArray(response.body)).toBe(false);
		// You can add more specific assertions about the data structure or content
	});
});