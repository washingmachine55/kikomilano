import express from 'express';
const router = express.Router();

import { createPayment } from '../controllers/payments.controller.js';

router.post('/new', createPayment);
router.post('/:orderid/new', createPayment);

export default router;
