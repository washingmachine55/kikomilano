# Kikomilano - E-Commerce API

A comprehensive Node.js/Express-based REST API for an e-commerce platform with user authentication, product management, orders, and user favorites functionality.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the Project](#️-running-the-project)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [API Endpoints](#-api-endpoints)

## ✨ Features

- **User Authentication**: Register, login, password reset, and token refresh
- **JWT-based Authorization**: Secure endpoints with Bearer token authentication
- **Product Management**: Browse products and their variants with category filtering
- **User Profiles**: View and edit user details, upload profile pictures
- **Favorites System**: Add/remove products to/from favorites
- **Order Management**: Create and manage orders
- **Email Notifications**: Forgot password with OTP verification
- **File Upload**: Profile picture uploads with Multer
- **Database Seeding**: Easy data population for development
- **API Documentation**: Interactive Swagger UI documentation
- **Comprehensive Testing**: Unit and integration tests with Mocha

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Validation**: Zod
- **API Documentation**: Swagger JSDoc + Swagger UI
- **Development**: Nodemon, ESLint, Prettier
- **Testing**: Mocha, Pactum

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v25.4.0 or higher
- **npm**: v11.8.0 or higher
- **PostgreSQL**: v18 or higher
- **Git**: For version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kikomilano
```

### 2. Install Dependencies

```bash
npm install
```

## 🔧 Environment Setup

### 1. Create `.env` File

Copy the `.env.example` file in the root directory and follow the instructions inside it to set the required variables:

### 2. Generate Secure Keys

You can generate secure keys using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Database Setup

### 1. Create PostgreSQL Database

```bash
createdb kikomilano
```

Or login to PostgreSQL and run:

```sql
CREATE DATABASE kikomilano;
```

### 2. Run Migrations

Create database tables:

```bash
npm run migration:create-tables
```

### 3. Seed Sample Data (Optional, but recommended)

Populate the database with sample data:

```bash
npm run migration:seed
```

### 4. Database Management

**Truncate all tables:**
```bash
npm run migration:truncate-all-tables
```

**Reset entire database:**
```bash
npm run migration:reset-database
```

## ▶️ Running the Project

### Development Mode with Auto-Reload

```bash
npm run dev-nm-server
```

This will:
- Start Nodemon for automatic server restart on file changes
- Generate Swagger documentation
- Run the server on `http://localhost:3000`

### Debug Mode

With debugging output:

```bash
npm run dev-nm-debug
```

With Node's watch feature:

```bash
npm run dev-node-debug
```

### Production Mode (requires PM2 to be installed)

```bash
pm2 start src/server.js --name kikomilano
```

## 📚 API Documentation

Once the server is running, access the interactive Swagger UI:

```
http://localhost:3000/api-docs
```

## 📁 Project Structure

```
kikomilano/
├── src/
│   ├── config/              	# Configuration files
│   │   ├── db.js           	# Database connection
│   │   ├── swagger.js      	# Swagger configuration
│   │   ├── multer.js       	# File upload config
│   │   ├── mailTransporter.js  # Nodemailer setup
│   │   └── googleAuth.js
│   ├── controllers/         	# Route handlers
│   │   ├── auth.controller.js
│   │   ├── products.controller.js
│   │   ├── users.controller.js
│   │   ├── orders.controller.js
│   ├── routes/             	# API routes
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   ├── users.routes.js
│   │   └── orders.routes.js
│   ├── services/           	# Business logic
│   │   ├── auth/
│   │   ├── products/
│   │   ├── users/
│   │   ├── orders/
│   │   └── categories/
│   ├── middlewares/        	# Custom middleware
│   │   ├── verifyToken.auth.js
│   │   ├── verifyInputFields.auth.js
│   │   ├── verifyInputFields.users.js
│   │   └── parseUUIDs.js
│   ├── migrations/         	# Database migrations
│   │   └── helpers/
│   ├── utils/              	# Utility functions
│   │   ├── responses.js
│   │   ├── errors.js
│   │   ├── jwtUtils.js
│   │   ├── validateUUID.js
│   │   └── ...
│   ├── providers/          	# Simple and custom Database query providers
│   │   └── recordChecks.providers.js
│   └── server.js           	# Express app entry point
├── test/                   	# Test files
│   ├── app.test.js
│   ├── auth.test.js
│   ├── products.test.js
│   ├── users.test.js
│   └── orders.test.js
├── SQL/                   		# Database schemas
│   ├── DDL-create-tables-v1.sql
│   ├── DDL-create-tables-v2.sql
│   ├── DDL-create-tables-v3.sql
│   └── DDL-truncate-tables-v*.sql
├── public/                 	# Static files
│   └── images/
│       └── uploads/        	# User uploaded files
├── .env                    	# Environment variables
├── package.json
├── eslint.config.js
└── README.md
```

## 📝 Available Scripts

### Development

```bash
npm run dev-nm-server        # Start server with Nodemon and Swagger autogen
npm run dev-nm-debug         # Start with debug output
npm run dev-node-debug       # Start with Node watch feature
```

### Code Quality

```bash
npm run format               # Format code with Prettier
npm run format:check         # Check formatting without changes
```

### Testing

```bash
npm run test    			# Run all tests once
```

### Database Management

```bash
npm run migration:create-tables           # Create database tables
npm run migration:seed                    # Seed sample data
npm run migration:truncate-all-tables     # Clear all table data
npm run migration:reset-database          # Full database reset (removes all tables)
```

## 🔌 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ No |
| POST | `/login` | User login | ❌ No |
| GET | `/verify-token` | Verify JWT token | ✅ Yes |
| GET | `/refresh` | Refresh tokens | ✅ Yes |
| POST | `/forgot-password` | Request password reset | ❌ No |
| POST | `/verify-otp` | Verify OTP | ❌ No |
| POST | `/reset-password` | Reset password | ✅ Yes |

### Users (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all users | ✅ Yes |
| GET | `/profile` | Get logged-in user profile | ✅ Yes |
| POST | `/profile/edit` | Edit user profile | ✅ Yes |
| POST | `/profile-picture-upload` | Upload profile picture | ✅ Yes |
| GET | `/favorites` | Get user favorites | ✅ Yes |
| POST | `/set-favorites` | Add product to favorites | ✅ Yes |
| POST | `/remove-favorites` | Remove from favorites | ✅ Yes |

### Products (`/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products (with optional category filter) | ✅ Yes |
| GET | `/:productId/variants` | Get product variants | ✅ Yes |

### Orders (`/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new order | ✅ Yes |


## 📧 Email Configuration

The application uses Nodemailer for sending emails (e.g., forgot password OTP).

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in your `.env` file.

### Alternative Email Providers

You can configure other email providers by modifying `src/config/mailTransporter.js`

## 🔐 Security Considerations

- All passwords are hashed using bcryptjs
- JWT tokens are used for API authentication	
- CORS is configured to allow cross-origin requests
- Input validation using Zod
- Request body size limits enforced
- File upload size limits (1MB default)
- Environment variables for sensitive data

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Last Updated**: 5th February 2026
**Version**: 1.2.0
