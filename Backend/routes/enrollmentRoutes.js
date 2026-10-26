import express from 'express';
import {
  enrollCourse,
  submitManualEnrollment,
  getEnrollments,
  getMyEnrollments,
  updateLectureProgress,
  getDashboardStats,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from '../controllers/enrollmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import multer from 'multer';

// Configure multer for memory storage (for Cloudinary receipt screenshot uploads)
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// @route   GET /api/enrollments/stats
// @desc    Get dashboard metrics and recent enrollments
// @access  Private/Admin
router.get('/stats', protect, admin, getDashboardStats);

// @route   GET /api/enrollments/admin/pending
// @desc    Get all pending enrollments awaiting Bankak receipt approval
// @access  Private/Admin
router.get('/admin/pending', protect, admin, getPendingEnrollments);

// @route   PUT /api/enrollments/admin/:id/approve
// @desc    Approve student manual enrollment
// @access  Private/Admin
router.put('/admin/:id/approve', protect, admin, approveEnrollment);

// @route   PUT /api/enrollments/admin/:id/reject
// @desc    Reject student manual enrollment with reason
// @access  Private/Admin
router.put('/admin/:id/reject', protect, admin, rejectEnrollment);

// @route   GET /api/enrollments/my-courses
// @desc    Get all courses enrolled by the currently logged-in student
// @access  Private (Student)
router.get('/my-courses', protect, getMyEnrollments);

// @route   PUT /api/enrollments/:id/progress
// @desc    Update lecture progress and check for course completion
// @access  Private (Student)
router.put('/:id/progress', protect, updateLectureProgress);

// @route   POST /api/enrollments/manual
// @desc    Submit manual Bankak receipt and screenshot for review
// @access  Private (Student)
router.post('/manual', protect, upload.single('receipt'), submitManualEnrollment);

// @route   POST /api/enrollments & GET /api/enrollments
// @desc    Enroll in a course / Get all platform enrollments (Admin)
// @access  Private (Student for POST, Admin for GET)
router.route('/')
  .post(protect, enrollCourse)
  .get(protect, admin, getEnrollments);

export default router;