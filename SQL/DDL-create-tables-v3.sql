CREATE TABLE IF NOT EXISTS tbl_users(
	id SERIAL PRIMARY KEY NOT NULL,
	phone_no CHAR(11) UNIQUE DEFAULT NULL,
	email VARCHAR(80) UNIQUE,
	password_hash VARCHAR(70) NOT NULL,
	access_type SMALLINT DEFAULT 0,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_images(
	id SERIAL PRIMARY KEY NOT NULL,
	image_url TEXT NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_addresses(
	id SERIAL PRIMARY KEY NOT NULL,
	address_name VARCHAR(10) NOT NULL,
	address_details VARCHAR(510) NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_discounts(
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
	code VARCHAR(10) NOT NULL,
	percent_off INTEGER CHECK (percent_off >= 1 AND percent_off <= 100) DEFAULT NULL,
	amount_off DECIMAL(6,2) DEFAULT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_details(
	id SERIAL PRIMARY KEY NOT NULL,
	users_id INTEGER UNIQUE NOT NULL,
	images_id INTEGER DEFAULT NULL,
	first_name VARCHAR(40) NOT NULL,
	last_name VARCHAR(40) NOT NULL,
	addresses_id INTEGER DEFAULT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (images_id) REFERENCES tbl_images(id),
	FOREIGN KEY (addresses_id) REFERENCES tbl_addresses(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_auth_providers(
	id SERIAL PRIMARY KEY NOT NULL,
	users_id INTEGER NOT NULL,
	provider VARCHAR(50) NOT NULL,
	provider_id VARCHAR(255) NOT NULL,
	callback_url TEXT NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_companies(
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(355) UNIQUE NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_categories(
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(355) UNIQUE NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_products(
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
	companies_id INTEGER NOT NULL,
	categories_id INTEGER NOT NULL,
	rating SMALLINT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
	images_id INTEGER DEFAULT NULL,
	price DECIMAL(6,2) NOT NULL,
	details TEXT NOT NULL,
	ingredients TEXT NOT NULL,
	instructions TEXT NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (images_id) REFERENCES tbl_images(id),
	FOREIGN KEY (companies_id) REFERENCES tbl_companies(id),
	FOREIGN KEY (categories_id) REFERENCES tbl_categories(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_variants(
	id SERIAL PRIMARY KEY NOT NULL,
	products_id INTEGER NOT NULL,
	color_code CHAR(6) NOT NULL,
	images_id INTEGER NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (products_id) REFERENCES tbl_products(id),
	FOREIGN KEY (images_id) REFERENCES tbl_images(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_variants_stocks(
	id SERIAL PRIMARY KEY NOT NULL,
	sku CHAR(8) UNIQUE NOT NULL,
	products_variants_id INTEGER NOT NULL,
	qty SMALLINT,
	price DECIMAL(6,2) NOT NULL,
	addresses_id INTEGER NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (products_variants_id) REFERENCES tbl_products_variants(id),
	FOREIGN KEY (addresses_id) REFERENCES tbl_addresses(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_tags(
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(255) UNIQUE NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_tags_bridge(
	products_id INTEGER NOT NULL,
	tags_id INTEGER NOT NULL,
	PRIMARY KEY (products_id, tags_id),
	FOREIGN KEY (products_id) REFERENCES tbl_products(id),
	FOREIGN KEY (tags_id) REFERENCES tbl_tags(id)
);

CREATE TABLE IF NOT EXISTS tbl_orders(
	id SERIAL PRIMARY KEY NOT NULL,
	users_id INTEGER NOT NULL,
	cart_total DECIMAL(6,2) NOT NULL,
	order_status SMALLINT DEFAULT 0,
	discounts_id INTEGER DEFAULT NULL,
	comments TEXT DEFAULT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (discounts_id) REFERENCES tbl_discounts(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_orders_products_bridge(
	id SERIAL PRIMARY KEY NOT NULL,
	orders_id INTEGER NOT NULL,
	products_variants_id INTEGER NOT NULL,
	comments TEXT DEFAULT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (orders_id) REFERENCES tbl_orders(id),
	FOREIGN KEY (products_variants_id) REFERENCES tbl_products_variants(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_products_favourites(
	id SERIAL PRIMARY KEY NOT NULL,
	users_id INTEGER NOT NULL,
	products_id INTEGER UNIQUE NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (products_id) REFERENCES tbl_products(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_notificatons(
	id SERIAL PRIMARY KEY NOT NULL,
	title VARCHAR(60) NOT NULL,
	description VARCHAR(255) NOT NULL,
	sent_time TIMESTAMP DEFAULT NOW(),
	users_id INTEGER NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);


CREATE TABLE IF NOT EXISTS tbl_payments_providers(
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
	callback_url TEXT NOT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_payments(
	id SERIAL PRIMARY KEY NOT NULL,
	orders_id INTEGER NOT NULL,
	amount DECIMAL(6,2) NOT NULL,
	payments_providers_id INTEGER NOT NULL,
	payment_method SMALLINT DEFAULT 0,
	payment_status SMALLINT DEFAULT 0,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (orders_id) REFERENCES tbl_orders(id),
	FOREIGN KEY (payments_providers_id) REFERENCES tbl_payments_providers(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_shipments(
	id SERIAL PRIMARY KEY NOT NULL,
	orders_id INTEGER NOT NULL,
	payments_id INTEGER NOT NULL,
	shipping_cost DECIMAL(6,2),
	shipments_status SMALLINT DEFAULT 0,
	comments TEXT DEFAULT NULL,
	created_by INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 0,
	FOREIGN KEY (orders_id) REFERENCES tbl_orders(id),
	FOREIGN KEY (payments_id) REFERENCES tbl_payments(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);