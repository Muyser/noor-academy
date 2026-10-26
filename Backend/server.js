import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { connectCloudinary } from './config/cloudinary.js';

// Import Route Handlers
// Admin import routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import languageRoutes from './routes/languageRoutes.js';
import blogPostRoutes from './routes/blogPostRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import statisticRoutes from './routes/statisticRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables
dotenv.config();

// Connect Database & Cloudinary
connectDB();
connectCloudinary();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Admin Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/posts', blogPostRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/payments', paymentRoutes);



// Health Check Route
app.get('/', (req, res) => {
  res.send('Noor Academy API Server is Running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});