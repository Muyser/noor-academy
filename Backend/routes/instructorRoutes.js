import express from 'express';
import {
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
} from '../controllers/instructorController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getInstructors);
router.post('/', protect, admin, upload.single('image'), createInstructor);
router.put('/:id', protect, admin, upload.single('image'), updateInstructor);
router.delete('/:id', protect, admin, deleteInstructor);

export default router;