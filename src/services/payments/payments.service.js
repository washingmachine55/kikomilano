import pool from '../../config/db.js';

export const savePaymentInfo = async (paymentIntent, orderDetails) => {
	const conn = await pool.connect();

	const paymentId = paymentIntent.id;
	const paymentAmount = Number(paymentIntent.amount) / 100;
	const paymentStatus = paymentIntent.status;
	const orderId = orderDetails.orders_id;

	const paymentProvider = await conn.query("SELECT id FROM tbl_payments_providers WHERE name = 'Stripe'");
	const paymentProviderId = paymentProvider.rows[0].id;

	const query = await conn.query(
		`
		INSERT INTO tbl_payments (orders_id, payments_providers_id, amount, providers_transaction_id,providers_transaction_status) VALUES ($1,$2,$3,$4,$5)
	`,
		[orderId, paymentProviderId, paymentAmount, paymentId, paymentStatus]
	);

	conn.release();
	return query.rows[0];
};
