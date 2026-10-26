import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  addLecture,
} from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public Routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected Admin Routes for Course Management
router.post('/', protect, admin, upload.single('image'), createCourse);
router.put('/:id', protect, admin, upload.single('image'), updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

// Protected Routes for Udemy-style Sections & Lessons
router.post('/:id/sections', protect, admin, addSection);
router.post(
  '/:id/sections/:sectionId/lectures',
  protect,
  admin,
  upload.single('file'), // Accepts video file, PDF file, or document
  addLecture
);

export default router;