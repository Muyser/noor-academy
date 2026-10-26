import express from 'express';
import { 
  generateCertificate, 
  getCertificates, 
  verifyCertificate,
  getMyCertificates
} from '../controllers/certificateController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to verify certificate by code
router.get('/verify/:code', verifyCertificate);

// Protected student endpoint to fetch their earned certificates
router.get('/my-certificates', protect, getMyCertificates);

// Protected student & admin routes
router.route('/')
  .post(protect, generateCertificate)
  .get(protect, admin, getCertificates);

export default router;