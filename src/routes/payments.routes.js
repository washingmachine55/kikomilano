import express from 'express';
const router = express.Router();

import { createPayment } from '../controllers/payments.controller.js';
// import verifyToken from '../middlewares/verifyToken.auth.js';

router.post('/:orderid/new', createPayment);

export default router;