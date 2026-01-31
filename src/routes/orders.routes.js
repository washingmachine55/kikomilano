import verifyToken from '../middlewares/verifyToken.auth.js';

import { validateUuidUrlParam } from '../middlewares/parseUUIDs.js';

import express from 'express';
import { createOrder } from '../controllers/orders.controller.js';
const router = express.Router();

router.post("/", createOrder)

export default router;