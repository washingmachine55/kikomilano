declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production' | 'test' | 'staging';
		APP_NAME: string;
		APP_DEBUG: string;
		APP_URL: string;
		BASE_URL: string;
		NODE_ENV: string;
		APP_PORT: number;
		APP_KEEP_ALIVE_TIMEOUT: number;
		APP_HEADERS_TIMEOUT: number;
		ACCESS_TOKEN_SECRET_KEY: string;
		ACCESS_TOKEN_EXPIRATION_TIME: number;
		REFRESH_TOKEN_SECRET_KEY: string;
		REFRESH_TOKEN_EXPIRATION_TIME: number;
		TEMPORARY_TOKEN_SECRET_KEY: string;
		TEMPORARY_TOKEN_EXPIRATION_TIME: number;
		UPLOAD_FILE_MAX_SIZE: number;
		SMTP_USER: string;
		SMTP_PASS: string;
		SMTP_HOST: string;
		SMTP_PORT: string;
		SMTP_SECURE: string;
		OTP_EXPIRATION_TIME: number;
		PGUSER: string;
		PGPASSWORD: string;
		PGHOST: string;
		PGPORT: number;
		PGDATABASE: string;
		POSTGRES_USER: string;
		POSTGRES_PASSWORD: string;
		POSTGRES_DB: string;
		STRIPE_PUBLISHABLE_KEY: string;
		STRIPE_SECRET_KEY: string;
		STRIPE_WEBHOOK_SIGNING_SECRET: string;
		CREATE_DATABASE_FILE_PATH: string;
		TRUNCATE_DATABASE_FILE_PATH: string;
		CURRENT_TZ: string;
		// Add other variables here
	}
}