CREATE TABLE IF NOT EXISTS tbl_companies(
	id SERIAL PRIMARY KEY,
	name VARCHAR(355)
);

CREATE TABLE IF NOT EXISTS tbl_categories(
	id SERIAL PRIMARY KEY,
	name VARCHAR(355)
);

CREATE TABLE IF NOT EXISTS tbl_tags(
	id SERIAL PRIMARY KEY,
	name VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS tbl_images(
	id SERIAL PRIMARY KEY,
	image_url TEXT
);

CREATE TABLE IF NOT EXISTS tbl_addresses(
	id SERIAL PRIMARY KEY,
	title VARCHAR(10),
	details VARCHAR(510)
);

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
	images_id INTEGER,
	first_name VARCHAR(40) NOT NULL,
	last_name VARCHAR(40) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	deleted_by INTEGER DEFAULT NULL,
	status SMALLINT,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (images_id) REFERENCES tbl_images(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_products(
	id SERIAL PRIMARY KEY,
	name VARCHAR(355),
	companies_id INTEGER,
	rating SMALLINT DEFAULT 5,
	images_id INTEGER,
	price DECIMAL(6,2),
	details TEXT DEFAULT NULL,
	ingredients TEXT DEFAULT NULL,
	instructions TEXT DEFAULT NULL,
	FOREIGN KEY (companies_id) REFERENCES tbl_companies(id),
	FOREIGN KEY (images_id) REFERENCES tbl_images(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_variants(
	id SERIAL PRIMARY KEY,
	products_id INTEGER,
	color_code CHAR(6) DEFAULT NULL,
	images_id INTEGER,
	FOREIGN KEY (products_id) REFERENCES tbl_products(id),
	FOREIGN KEY (images_id) REFERENCES tbl_images(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_variants_stocks(
	id SERIAL PRIMARY KEY,
	SKU CHAR(8) UNIQUE,
	products_variants_id INTEGER,
	qty SMALLINT DEFAULT 1,
	price DECIMAL(6,2),
	addresses_id INTEGER,
	FOREIGN KEY (products_variants_id) REFERENCES tbl_products_variants(id),
	FOREIGN KEY (addresses_id) REFERENCES tbl_addresses(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_tags_bridge(
	products_id INTEGER,
	tags_id INTEGER,
	PRIMARY KEY (products_id, tags_id),
	FOREIGN KEY (products_id) REFERENCES tbl_products(id)
	FOREIGN KEY (tags_id) REFERENCES tbl_tags(id)
);

CREATE TABLE IF NOT EXISTS tbl_orders(
	id SERIAL PRIMARY KEY,
	users_id INTEGER,
	cart_total DECIMAL(6,2),
	paid BOOLEAN DEFAULT FALSE,
	order_status SMALLINT DEFAULT 0,
	comments TEXT DEFAULT NULL,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_shipments(
	id SERIAL PRIMARY KEY,
	orders_id INTEGER,
	shipping_cost DECIMAL(6,2),
	paid BOOLEAN DEFAULT FALSE,
	shipments_status SMALLINT DEFAULT 0,
	comments TEXT DEFAULT NULL,
	FOREIGN KEY (orders_id) REFERENCES tbl_orders(id)
);

CREATE TABLE IF NOT EXISTS tbl_orders_products(
	id SERIAL PRIMARY KEY,
	orders_id INTEGER,
	products_id INTEGER,
	comments TEXT DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (orders_id) REFERENCES tbl_orders(id),
	FOREIGN KEY (products_id) REFERENCES tbl_products(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_products_favorites(
	id SERIAL PRIMARY KEY,
	products_id INTEGER,
	users_id INTEGER,
	FOREIGN KEY (products_id) REFERENCES tbl_products(id),
	FOREIGN KEY (users_id) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_notifications(
	id SERIAL PRIMARY KEY,
	users_id INTEGER,
	title VARCHAR(60),
	description VARCHAR(255),
	sent_time TIMESTAMP DEFAULT NOW(),
	FOREIGN KEY (users_id) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_transactions(
	id SERIAL PRIMARY KEY,
	shipments_id INTEGER,
	amount DECIAMAL(6,2),
	payment_method SMALLINT DEFAULT	0
	FOREIGN KEY (shipments_id) REFERENCES tbl_shipments(id)
);