import express from 'express';
import {
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from '../controllers/languageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getLanguages);
router.post('/', protect, admin, createLanguage);
router.put('/:id', protect, admin, updateLanguage);
router.delete('/:id', protect, admin, deleteLanguage);

export default router;