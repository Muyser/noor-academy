import express from 'express';
import { getStatistics } from '../controllers/statisticController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected: Only logged-in admins can view these stats
router.get('/', protect, admin, getStatistics);

export default router;