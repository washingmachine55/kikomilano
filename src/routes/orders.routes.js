import verifyToken from '../middlewares/verifyToken.auth.js';
import { validateUuidUrlParam } from '../middlewares/parseUUIDs.js';
import express from 'express';
import { createOrder } from '../controllers/orders.controller.js';
const router = express.Router();

router.use(verifyToken);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new orders.
 *     description: Allows authenticated user to create a new order. Requires a valid user UUID and order details.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             data:
 *               users_id: '019c0a0c-6a5c-7c53-9686-4f155b77123b'
 *               products:
 *                 - products_variants_id: '019c0a0c-6a5c-7c53-9686-4f155b77456c'
 *                   qty: 2
 *               cart_total: 99.99
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               type: 1
 *               message: Order created successfully
 *               data:
 *                 order_details:
 *                    id: "019c29ba-872a-7c2e-9d11-b9c967893346"
 *                    users_id: "019c28e7-5042-7ea5-86f1-70fca1d7f10b"
 *                    cart_total: "255.55"
 *                    order_status: "0"
 *                    discounts_id: "null"
 *                    comments: "null"
 *                    created_by: "019c28e7-5042-7ea5-86f1-70fca1d7f10b"
 *                    created_at: "2026-02-04T17:36:56.106Z"
 *                    updated_by: "null"
 *                    updated_at: "null"
 *                    deleted_by: "null"
 *                    deleted_at: "null"
 *                    status: "1"
 *                 order_products:
 *                    - id: "019c29ba-872d-778e-b905-74ea5f92054a"
 *                      orders_id: "019c29ba-872a-7c2e-9d11-b9c967893346"
 *                      products_variants_id: "019c28e5-33d5-7384-b936-d1a51cd7b6c8"
 *                      quantity: "3"
 *                      comments: "null"
 *                      created_by: "019c28e7-5042-7ea5-86f1-70fca1d7f10b"
 *                      created_at: "2026-02-04T17:36:56.106Z"
 *                      updated_by: "null"
 *                      updated_at: "null"
 *                      deleted_by: "null"
 *                      deleted_at: "null"
 *                      status: 1
 *       400:
 *         description: Invalid user UUID or missing required fields.
 *       401:
 *         description: Unauthorized. Access Denied. Please login.
 */
router.post('/', verifyToken, createOrder);

export default router;
