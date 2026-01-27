CREATE TABLE IF NOT EXISTS tbl_users (
	id SERIAL PRIMARY KEY,
	phone_no VARCHAR(11) DEFAULT NULL,
	email VARCHAR(80),
	password_hash VARCHAR(70) NOT NULL ,
	access_type SMALLINT DEFAULT 1,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	status SMALLINT,
	UNIQUE (email),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_details (
	id SERIAL PRIMARY KEY,
	users_id INTEGER NOT NULL,
	profile_pic_url VARCHAR(1000) DEFAULT NULL,
	first_name VARCHAR(40) NOT NULL,
	last_name VARCHAR(40) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	status SMALLINT,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_otp(
	id SERIAL PRIMARY KEY,
	users_id INTEGER NOT NULL,
	otp_value CHAR(6) NOT NULL CHECK (otp_value ~ '^[0-9]{6}$'),
	date_sent TIMESTAMP NOT NULL,
	date_expiration TIMESTAMP NOT NULL,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_tokens (
	id SERIAL PRIMARY KEY,
	users_id INTEGER,
	refersh_token VARCHAR(360) NOT NULL,
	access_token VARCHAR(360) NOT NULL,
	token_type SMALLINT,
	created_at TIMESTAMP DEFAULT NOW(),
	expires_at TIMESTAMP NOT NULL,
	status SMALLINT,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id)
);