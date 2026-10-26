import express from 'express';
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getGalleryItems);
router.post('/', protect, admin, upload.single('image'), createGalleryItem);
router.put('/:id', protect, admin, upload.single('image'), updateGalleryItem);
router.delete('/:id', protect, admin, deleteGalleryItem);

export default router;