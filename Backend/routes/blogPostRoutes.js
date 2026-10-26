import express from 'express';
import {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blogPostController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js'; 

const router = express.Router();

// Public Routes
router.get('/', getBlogPosts);
router.get('/:id', getBlogPostById);

// Protected Admin Routes with Multer File Upload
router.post('/', protect, admin, upload.single('cover_image'), createBlogPost);
router.put('/:id', protect, admin, upload.single('cover_image'), updateBlogPost);
router.delete('/:id', protect, admin, deleteBlogPost);

export default router;