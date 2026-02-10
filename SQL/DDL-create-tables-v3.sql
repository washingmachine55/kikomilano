CREATE TABLE IF NOT EXISTS tbl_users(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	phone_no CHAR(11) UNIQUE DEFAULT NULL,
	email VARCHAR(80) UNIQUE,
	password_hash VARCHAR(70) NOT NULL,
	access_type SMALLINT DEFAULT 0,
	provider_name VARCHAR(50) UNIQUE DEFAULT NULL,
	callback_url TEXT DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_otp(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	users_id UUID NOT NULL,
	otp_value CHAR(6) NOT NULL CHECK (otp_value ~ '^[0-9]{6}$'),
	date_sent TIMESTAMP NOT NULL,
	date_expiration TIMESTAMP NOT NULL,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_images(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	image_url TEXT NOT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_addresses(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	address_name VARCHAR(10) DEFAULT NULL,
	address_line VARCHAR(255) DEFAULT NULL,
	street_num VARCHAR(8) DEFAULT NULL,
	street_addr VARCHAR(100) DEFAULT NULL,
	street_addr_line_2 VARCHAR(100) DEFAULT NULL,
	city VARCHAR(35) DEFAULT NULL,
	region VARCHAR(25) DEFAULT NULL,
	zip_code CHAR(5) DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_discounts(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	name VARCHAR(255) NOT NULL,
	code VARCHAR(10) NOT NULL,
	percent_off INTEGER CHECK (percent_off >= 1 AND percent_off <= 100) DEFAULT NULL,
	amount_off DECIMAL(6,2) DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_details(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	users_id UUID UNIQUE NOT NULL,
	images_id UUID DEFAULT NULL,
	first_name VARCHAR(40) NOT NULL,
	last_name VARCHAR(40) NOT NULL,
	addresses_id UUID DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (images_id) REFERENCES tbl_images(id),
	FOREIGN KEY (addresses_id) REFERENCES tbl_addresses(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_companies(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	name VARCHAR(355) UNIQUE NOT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_categories(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	name VARCHAR(355) UNIQUE NOT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_attributes(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	name VARCHAR(25) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tbl_attributes_values(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	attributes_id UUID NOT NULL,
	name VARCHAR(25) UNIQUE NOT NULL,
	FOREIGN KEY (attributes_id) REFERENCES tbl_attributes(id)
);

CREATE TABLE IF NOT EXISTS tbl_products(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	name VARCHAR(255) NOT NULL,
	companies_id UUID NOT NULL,
	categories_id UUID NOT NULL,
	rating SMALLINT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
	details TEXT NOT NULL,
	ingredients TEXT NOT NULL,
	instructions TEXT NOT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (companies_id) REFERENCES tbl_companies(id),
	FOREIGN KEY (categories_id) REFERENCES tbl_categories(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_variants(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	products_id UUID NOT NULL,
	main BOOLEAN NOT NULL DEFAULT FALSE,
	name VARCHAR(255) DEFAULT NULL,
	images_id UUID NOT NULL,
	sku CHAR(8) UNIQUE NOT NULL,
	quantity_stock NUMERIC(1,0) NOT NULL,
	price_cost DECIMAL(6,2) NOT NULL,
	price_retail DECIMAL(6,2) NOT NULL,
	addresses_id UUID DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (products_id) REFERENCES tbl_products(id),
	FOREIGN KEY (images_id) REFERENCES tbl_images(id),
	FOREIGN KEY (addresses_id) REFERENCES tbl_addresses(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_variants_attributes_values(
	products_variants_id UUID NOT NULL,
	attributes_id UUID NOT NULL,
	attributes_values_id UUID NOT NULL,
	UNIQUE (products_variants_id, attributes_id),
	PRIMARY KEY (products_variants_id, attributes_values_id),
	FOREIGN KEY (attributes_id) REFERENCES tbl_attributes(id),
	FOREIGN KEY (products_variants_id) REFERENCES tbl_products_variants(id),
	FOREIGN KEY (attributes_values_id) REFERENCES tbl_attributes_values(id)
);

CREATE TABLE IF NOT EXISTS tbl_tags(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	name VARCHAR(255) UNIQUE NOT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_products_tags(
	products_id UUID NOT NULL,
	tags_id UUID NOT NULL,
	PRIMARY KEY (products_id, tags_id),
	UNIQUE (products_id, tags_id),
	FOREIGN KEY (products_id) REFERENCES tbl_products(id),
	FOREIGN KEY (tags_id) REFERENCES tbl_tags(id)
);

CREATE TABLE IF NOT EXISTS tbl_orders(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	users_id UUID NOT NULL,
	cart_total DECIMAL(6,2) NOT NULL,
	order_status SMALLINT DEFAULT 0,
	discounts_id UUID DEFAULT NULL,
	comments TEXT DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (discounts_id) REFERENCES tbl_discounts(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_orders_products(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	orders_id UUID NOT NULL,
	products_variants_id UUID NOT NULL,
	quantity NUMERIC(2,0) CHECK (quantity > 0 AND quantity < 20),
	comments TEXT DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (orders_id) REFERENCES tbl_orders(id),
	FOREIGN KEY (products_variants_id) REFERENCES tbl_products_variants(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_users_products_favorites(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	users_id UUID NOT NULL,
	products_variants_id UUID NOT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (products_variants_id) REFERENCES tbl_products_variants(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_notifications(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	title VARCHAR(60) NOT NULL,
	description VARCHAR(255) NOT NULL,
	sent_time TIMESTAMP DEFAULT NOW(),
	users_id UUID NOT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (users_id) REFERENCES tbl_users(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_payments_providers(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	name VARCHAR(255) NOT NULL,
	callback_url TEXT DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_payments(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	orders_id UUID NOT NULL,
	amount DECIMAL(6,2) NOT NULL,
	payments_providers_id UUID NOT NULL,
	providers_transaction_id VARCHAR(1000) DEFAULT NULL,
	providers_transaction_status VARCHAR(50) DEFAULT NULL,
	payment_method SMALLINT DEFAULT 0,
	payment_status SMALLINT DEFAULT 0,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (orders_id) REFERENCES tbl_orders(id),
	FOREIGN KEY (payments_providers_id) REFERENCES tbl_payments_providers(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE TABLE IF NOT EXISTS tbl_shipments(
	id UUID PRIMARY KEY DEFAULT UUIDv7(),
	orders_id UUID NOT NULL,
	payments_id UUID NOT NULL,
	shipping_cost DECIMAL(6,2),
	shipments_status SMALLINT DEFAULT 0,
	comments TEXT DEFAULT NULL,
	created_by UUID DEFAULT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by UUID DEFAULT NULL,
	updated_at TIMESTAMP DEFAULT NULL,
	deleted_by UUID DEFAULT NULL,
	deleted_at TIMESTAMP DEFAULT NULL,
	status SMALLINT DEFAULT 1,
	FOREIGN KEY (orders_id) REFERENCES tbl_orders(id),
	FOREIGN KEY (payments_id) REFERENCES tbl_payments(id),
	FOREIGN KEY (created_by) REFERENCES tbl_users(id),
	FOREIGN KEY (updated_by) REFERENCES tbl_users(id),
	FOREIGN KEY (deleted_by) REFERENCES tbl_users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS one_main_per_product
ON tbl_products_variants (products_id, main)
WHERE main = TRUE;

-- CREATE UNIQUE INDEX one_color_code_per_product
-- ON tbl_products_variants_attributes_values (
--   attributes_values_id,
--   (SELECT products_id
--    FROM tbl_products_variants
--    WHERE tbl_products_variants.id = products_variants_id)
-- )
-- WHERE attributes_values_id IN (
--   SELECT av.id
--   FROM tbl_attributes_values av
--   JOIN tbl_attributes a ON a.id = av.attributes_id
--   WHERE a.name = 'Color Code'
-- );
-- INSERT INTO tbl_categories(name)
-- VALUES ('FACE'), ('HAIR'), ('SKIN'), ('BODY');
-- INSERT INTO tbl_tags(name)
-- VALUES ('Cruelty Free'), ('Paraben Free'), ('Vegan'), ('Suitable for Sensetive Skin'), ('Dermatologist Tested');
-- INSERT INTO tbl_attributes(name)
-- VALUES ('Color Code');