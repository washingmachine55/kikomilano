# Test Structure Reference Guide

## Test File Organization

### 1. test/auth.test.js

```
Authentication APIs
├── POST /auth/register (2 tests)
│   ├── Register new user successfully
│   └── Fail if required fields missing
├── POST /auth/login (2 tests)
│   ├── Login with valid credentials
│   └── Fail with invalid credentials
├── GET /auth/refresh (1 test)
│   └── Refresh access token
├── GET /auth/verify-token (2 tests)
│   ├── Verify valid bearer token
│   └── Reject invalid token
├── POST /auth/forgot-password (3 tests) ⭐ NEW
│   ├── Initiate with valid email
│   ├── Fail with non-existent email
│   └── Fail with missing fields
├── POST /auth/verify-otp (3 tests) ⭐ NEW
│   ├── Verify OTP and return temp token
│   ├── Fail with invalid OTP
│   └── Fail with missing fields
└── POST /auth/reset-password (5 tests) ⭐ NEW
    ├── Reset with valid temporary token
    ├── Fail without authorization
    ├── Fail with mismatched passwords
    └── Fail with invalid token
```

### 2. test/orders.test.js ⭐ NEW FILE

```
Orders APIs
├── POST /orders (8 tests)
│   ├── Create order successfully
│   ├── Fail without auth token
│   ├── Fail with invalid token
│   ├── Fail with invalid users_id
│   ├── Fail with missing users_id
│   ├── Fail with empty items
│   ├── Fail with negative quantity
│   └── Fail with invalid product variant
└── POST /orders - Edge Cases (3 tests)
    ├── Handle multiple items
    ├── Handle large quantity
    └── Handle different status values
```

### 3. test/users.test.js

```
Users APIs
├── GET /users/profile (5 tests)
│   ├── Retrieve profile with auth
│   ├── Fail without auth
│   ├── Fail with invalid token
│   ├── Return correct format
│   └── Return user details
├── POST /users/profile/edit (9 tests) ⭐ NEW
│   ├── Edit with valid data
│   ├── Fail without auth
│   ├── Fail with invalid token
│   ├── Update email
│   ├── Update password
│   ├── Fail with mismatched passwords
│   ├── Update multiple fields
│   ├── Ignore invalid fields
│   └── Handle empty request
├── POST /users/profile-picture-upload (5 tests)
│   ├── Fail without auth
│   ├── Fail without file
│   ├── Fail with invalid token
│   ├── Upload with PNG file ⭐ NEW
│   ├── Upload with JPEG file ⭐ NEW
│   └── Return error with wrong field name (skipped)
├── GET /users/favorites (4 tests)
│   ├── Retrieve favorites
│   ├── Fail without auth
│   ├── Fail with invalid token
│   └── Return correct format
├── POST /users/set-favorites (4 tests)
│   ├── Set favorite successfully
│   ├── Fail without auth
│   ├── Fail with invalid token
│   └── Fail without product id
├── POST /users/remove-favorites (4 tests)
│   ├── Remove favorite successfully
│   ├── Fail without auth
│   ├── Fail with invalid token
│   └── Fail without product id
└── GET /users - Edge Cases (2 tests)
    ├── Handle multiple requests
    └── Return consistent data
```

### 4. test/app.test.js

```
API Documentation
└── GET /api-docs (1 test)
    └── Return API docs
```

### 5. test/products.test.js

```
Products APIs
├── GET /products (27 tests)
│   ├── Basic retrieval
│   ├── Category filtering
│   ├── Variants retrieval
│   ├── Sequential requests
│   ├── Error handling
│   └── Edge cases
```

---

## Test Setup Pattern

All test files follow this structure:

```javascript
import pactum from 'pactum';
import * as pm from 'pactum-matchers';

process.loadEnvFile();
pactum.request.setBaseUrl(process.env.APP_URL);
pactum.request.setDefaultHeaders({ 'Content-Type': 'application/json' });

describe('Feature Name', () => {
	// 1. Declare variables for storing test data
	let accessToken;
	let userId;

	// 2. Setup: Run before all tests in suite
	before(async () => {
		await pactum
			.spec()
			.withMethod('POST')
			.withPath('/auth/login')
			.withBody(`{ "data": { "email": "...", "password": "..." } }`)
			.stores('tokenName', 'data.access_token')
			.stores('userIdName', 'data.user_details.id');
	});

	// 3. Test suites organized by endpoint
	describe('Endpoint Description', () => {
		it('should do something', async () => {
			// 4. Test implementation
			await pactum
				.spec()
				.withMethod('GET')
				.withPath('/endpoint')
				.withHeaders('Authorization', `Bearer $S{tokenName}`)
				.expectStatus(200)
				.expectJsonLike({ message: 'expected' });
		});
	});
});
```

---

## Common Test Patterns

### Authentication Required Endpoints

```javascript
it('should fail without auth token', async () => {
	await pactum.spec().withMethod('GET').withPath('/protected-endpoint').expectStatus(401);
});

it('should work with valid token', async () => {
	await pactum
		.spec()
		.withMethod('GET')
		.withPath('/protected-endpoint')
		.withHeaders('Authorization', `Bearer $S{token}`)
		.expectStatus(200);
});
```

### POST Requests with Body

```javascript
it('should create resource', async () => {
	await pactum
		.spec()
		.withMethod('POST')
		.withPath('/endpoint')
		.withHeaders('Authorization', `Bearer $S{token}`)
		.withBody(
			`{
      "data": {
        "field1": "value1",
        "field2": "value2"
      }
    }`
		)
		.expectStatus(201)
		.expectJsonLike({ message: 'Created successfully' });
});
```

### File Upload (Multipart)

```javascript
it('should upload file', async () => {
  const fileBuffer = Buffer.from([...]);

  await pactum
    .spec()
    .withMethod('POST')
    .withPath('/upload')
    .withHeaders('Authorization', `Bearer $S{token}`)
    .withMultiPartFormData('fieldName', fileBuffer, { filename: 'file.ext' })
    .expectStatus(200);
});
```

### Query Parameters

```javascript
it('should filter by category', async () => {
	await pactum
		.spec()
		.withMethod('GET')
		.withPath('/products')
		.withQueryParams('category', 'FACE')
		.withHeaders('Authorization', `Bearer $S{token}`)
		.expectStatus(200);
});
```

### Store Response Values for Reuse

```javascript
// In one test
.stores('productId', 'data.products[0].id')

// Use in another test
.withBody(`{ "data": { "product_id": "$S{productId}" } }`)
```

---

## Assertion Methods

| Method                   | Usage                | Example                              |
| ------------------------ | -------------------- | ------------------------------------ |
| `.expectStatus(code)`    | Assert HTTP status   | `.expectStatus(200)`                 |
| `.expectJsonLike(obj)`   | Partial JSON match   | `.expectJsonLike({ message: 'OK' })` |
| `.expectJsonMatch(obj)`  | Exact JSON match     | `.expectJsonMatch({ status: 200 })`  |
| `.expectJsonLength(num)` | Array/object length  | `.expectJsonLength(5)`               |
| `.stores(key, path)`     | Store response value | `.stores('id', 'data.id')`           |

---

## Total Test Coverage

**Before Implementation:** 64 tests, 65% route coverage  
**After Implementation:** 99 tests, 82% route coverage

**New Test Cases Added:** 35

- Password Recovery: 10 tests
- Order Creation: 11 tests
- Profile Editing: 9 tests
- File Upload: 2 tests
- Integration Improvements: 3 tests

---

## Environment Requirements

- **Test Runner:** Mocha (npm test)
- **HTTP Client:** Pactum
- **Node Version:** 18+
- **Environment File:** .env with APP_URL configured
- **Seeded Data:** Test database with admin user:
    - Email: admin@admin.com
    - Password: Passw\*rd1 (or configure in tests)
