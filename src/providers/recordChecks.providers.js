import pool from "../config/db.js";
import { ValidationError } from "../utils/errors.js";


const tableNamesWhitelist = ['tbl_addresses', 'tbl_attributes', 'tbl_attributes_values', 'tbl_categories', 'tbl_companies', 'tbl_discounts', 'tbl_images', 'tbl_notifications', 'tbl_orders', 'tbl_orders_products', 'tbl_payments', 'tbl_payments_providers', 'tbl_products', 'tbl_products_tags', 'tbl_products_variants', 'tbl_products_variants_attributes_values', 'tbl_shipments', 'tbl_tags', 'tbl_users', 'tbl_users_details', 'tbl_users_otp', 'tbl_users_products_favorites']

const fieldNameWhitelist = ['access_type', 'address_name', 'addresses_id', 'amount', 'amount_off', 'attributes_id', 'attributes_values_id', 'callback_url', 'cart_total', 'categories_id', 'city', 'code', 'comments', 'companies_id', 'created_at', 'created_by', 'date_expiration', 'date_sent', 'deleted_at', 'deleted_by', 'description', 'details', 'discounts_id', 'email', 'first_name', 'id', 'image_url', 'images_id', 'ingredients', 'instructions', 'last_name', 'main', 'name', 'order_status', 'orders_id', 'otp_value', 'password_hash', 'payment_method', 'payment_status', 'payments_id', 'payments_providers_id', 'percent_off', 'phone_no', 'price_cost', 'price_retail', 'products_id', 'products_variants_id', 'provider_name', 'providers_transaction_id', 'quantity', 'quantity_stock', 'rating', 'region', 'sent_time', 'shipments_status', 'shipping_cost', 'sku', 'status', 'street_addr', 'street_addr_line_2', 'street_num', 'tags_id', 'title', 'updated_at', 'updated_by', 'users_id', 'zip_code']

export class RecordCheck {

	constructor(field, table, request) {
		this.field = field;
		this.table = table;
		this.request = request;
	}

	async confirmFromWhitelist() {
		if (!fieldNameWhitelist.includes(this.field)) {
			throw new ValidationError("Field name does not exist in whitelist");
		}
		if (!tableNamesWhitelist.includes(this.table)) {
			throw new ValidationError("Table name does not exist in whitelist");
		}
	}

	async getResult() {
		return await pool.query(`
			SELECT CASE WHEN EXISTS(SELECT ${this.field} FROM ${this.table} WHERE ${this.field} = $1) THEN true ELSE false END AS ExistsCheck;
		`, [this.request])
			.then(res => res.rows[0].existscheck)
			.catch(err => {throw Error(`Unable to check if the record exists`, err.message)});
	}

	async getResultWhereStatus() {
		return await pool.query(`
			SELECT CASE WHEN EXISTS(SELECT ${this.field} FROM ${this.table} WHERE ${this.field} = $1 AND STATUS = 0) THEN true ELSE false END AS ExistsCheck;
		`, [this.request])
			.then(res => res.rows[0].existscheck)
			.catch(err => {throw Error(`Unable to check if the record exists`, err.message)});
	}
}

	// userCheck = async (request) => pool.query(`SELECT CASE WHEN EXISTS(SELECT id FROM tbl_users WHERE id = $1) THEN true ELSE false END AS ExistsCheck;`, [request]).then(res => res.rows[0].existscheck).catch(err => new Error("Unable to check if user exists", err));

// export const userCheck = async (request) => pool.query('SELECT CASE WHEN EXISTS(SELECT id FROM tbl_users WHERE id = $1) THEN true ELSE false END AS ExistsCheck;', [request]).then(res => res.rows[0].existscheck).catch(err => new Error("Unable to check if user exists", err));

// export const productCheck = async (request) => pool.query('SELECT CASE WHEN EXISTS(SELECT id FROM tbl_products WHERE id = $1) THEN true ELSE false END AS ExistsCheck;', [request]).then(res => res.rows[0].existscheck).catch(err => new Error("Unable to check if product exists", err));

// export const productVariantCheck = async (request) => pool.query('SELECT CASE WHEN EXISTS(SELECT id FROM tbl_products_variants WHERE id = $1) THEN true ELSE false END AS ExistsCheck;', [request]).then(res => res.rows[0].existscheck).catch(err => new Error("Unable to check if product's variant exists", err));

