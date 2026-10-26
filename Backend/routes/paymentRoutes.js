import express from 'express';
import {
  initializePayment,
  handleWebhook,
  getMyTransactions,
} from '../controllers/PaymentController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// 1. Stripe Webhook Endpoint
// CRITICAL: Webhooks require express.raw() body parsing to verify signatures!
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// 2. Initialize Stripe Checkout Session Endpoint (Protected)
router.post('/initialize', protect, initializePayment);

// 3. Get User Transaction History (Protected)
router.get('/my-transactions', protect, getMyTransactions);

export default router;