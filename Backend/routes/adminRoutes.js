import express from 'express';
import { getAllUsers, deleteUser } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect and admin middleware to all routes in this router
router.use(protect, admin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

export default router;