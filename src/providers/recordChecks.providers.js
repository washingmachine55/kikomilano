import pool from "../config/db.js";

export class RecordCheck {
	constructor(field, table, request) {
		this.field = field;
		this.table = table;
		this.request = request;
	}

	async getResult() {
		return pool.query(`
			SELECT CASE WHEN EXISTS(SELECT ${this.field} FROM ${this.table} WHERE ${this.field} = $1) THEN true ELSE false END AS ExistsCheck;
		`, [this.request])
			.then(res => res.rows[0].existscheck)
			.catch(err => {throw Error(`Unable to check if the record exists`, err.message)});
	}

	async getResultWhereStatus() {
		return pool.query(`
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

