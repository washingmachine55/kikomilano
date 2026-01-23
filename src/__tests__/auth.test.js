import request from 'supertest';
import app from '../server.js';

describe("Authentication API", () => {

	describe("POST /auth/register", () => {
		it("should register a new user successfully", async () => {
			const res = await request(app)
				.post("/auth/register")
				.send({
					data: {
						name: "John Doe",
						email: "john@example.com",
						password: "secret_password",
						confirmed_password: "secret_password"
					}
				});

			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty("message");
			expect(res.body).toHaveProperty("data");
		});

		it("should fail if required fields are missing", async () => {
			const res = await request(app)
				.post("/auth/register")
				.send({
					data: {
						name: "John Doe"
					}
				});

			expect(res.body).toHaveProperty("message");
			expect(res.body.status).toBe(400);
		});
	});

	describe("POST /auth/login", () => {
		it("should login a user with valid credentials", async () => {
			const res = await request(app)
				.post("/auth/login")
				.send({
					data: {
						email: "john@example.com",
						password: "secret_password"
					}
				});

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty("accessToken");
			expect(res.body).toHaveProperty("refreshToken");
		});

		it("should fail with invalid credentials", async () => {
			const res = await request(app)
				.post("/auth/login")
				.send({
					data: {
						email: "john@example.com",
						password: "wrong_password"
					}
				});

			expect(res.statusCode).toBe(401);
			expect(res.body).toHaveProperty("error");
		});
	});

	describe("POST /auth/refresh", () => {
		it("should refresh access token", async () => {
			const login = await request(app).post("/auth/login").send({
				data: {
					email: "john@example.com",
					password: "wrong_password"
				}
			});

			const refreshToken = login.data[0].access_token;
			const res = await request(app)
				.post("/auth/refresh")
				.send({
					refreshToken: `${refreshToken}`
				});

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty("accessToken");
		});
	});

	describe("GET /auth/verify-token", () => {
		it("should verify a valid bearer token", async () => {
			const login = await request(app).post("/auth/login").send({
				data: {
					email: "john@example.com",
					password: "wrong_password"
				}
			});
			
			const refreshToken = login.data[0].access_token;
			// const token = "valid_jwt_token";

			const res = await request(app)
				.get("/auth/verify-token")
				.set("Authorization", `Bearer ${refreshToken}`);

			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty("message", true);
			expect(res.body).toHaveProperty("type", 1);
		});

		it("should reject an invalid token", async () => {
			const res = await request(app)
				.get("/auth/verify-token")
				.set("Authorization", "Bearer invalid_token");

			expect(res.statusCode).toBe(401);
		});
	});

});
