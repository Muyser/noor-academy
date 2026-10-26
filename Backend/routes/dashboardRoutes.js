import express from 'express';
import { getStudentDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/stats -> Protected student analytics
router.get('/stats', protect, getStudentDashboardStats);

export default router;