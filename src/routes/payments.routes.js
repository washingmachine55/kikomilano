import express from 'express';
const router = express.Router();

import { createPayment } from '../controllers/payments.controller.js';
import verifyToken from '../middlewares/verifyToken.auth.js';

router.use(verifyToken)

router.post('/new', createPayment);

export default router;