import express from 'express';
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../controllers/faqController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getFaqs);

// Protected Admin routes
router.post('/', protect, admin, createFaq);
router.put('/:id', protect, admin, updateFaq);
router.delete('/:id', protect, admin, deleteFaq);

export default router;