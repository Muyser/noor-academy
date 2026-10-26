import Enrollment from '../models/EnrollmentModel.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Certificate from '../models/CertificateModel.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// @desc    Enroll a student into a course
// @route   POST /api/enrollments
// @access  Private (Student)
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'active',
      payment_method: 'free',
      payment_status: 'completed',
      progress: 0,
      completed_lectures: [],
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit manual Bankak receipt for enrollment review
// @route   POST /api/enrollments/manual
// @access  Private (Student)
export const submitManualEnrollment = async (req, res) => {
  try {
    const { courseId, transactionId } = req.body;
    const studentId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: 'Receipt screenshot image is required' });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'noor_pro_receipts',
      resource_type: 'image',
    });

    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });

    if (enrollment) {
      enrollment.status = 'pending_approval';
      enrollment.payment_status = 'pending';
      enrollment.payment_method = 'bank_transfer_sudan';
      enrollment.payment_proof = {
        screenshot_url: uploadResponse.secure_url,
        transaction_id: transactionId || '',
        uploaded_at: new Date(),
      };
      await enrollment.save();
      return res.status(200).json(enrollment);
    }

    enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'pending_approval',
      payment_method: 'bank_transfer_sudan',
      payment_status: 'pending',
      payment_proof: {
        screenshot_url: uploadResponse.secure_url,
        transaction_id: transactionId || '',
        uploaded_at: new Date(),
      },
      progress: 0,
      completed_lectures: [],
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all enrollments (Admin View)
// @route   GET /api/enrollments
// @access  Private/Admin
export const getEnrollments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;

    const enrollments = await Enrollment.find({})
      .populate('student', 'full_name name email phone')
      .populate('course', 'title title_ar category price')
      .sort({ enrolled_date: -1 })
      .limit(limit);

    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get enrolled courses for current logged-in student
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'sections' },
      })
      .sort({ enrolled_date: -1 });

    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student course progress (Mark lecture completed)
// @route   PUT /api/enrollments/:id/progress
// @access  Private (Student)
export const updateLectureProgress = async (req, res) => {
  try {
    const { lectureId } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment record not found' });
    }

    if (enrollment.status !== 'active') {
      return res.status(403).json({ message: 'Your enrollment is not active or is pending approval.' });
    }

    const course = await Course.findById(enrollment.course);
    if (!course) {
      return res.status(404).json({ message: 'Associated course not found' });
    }

    let totalLectures = 0;
    if (course.sections && Array.isArray(course.sections)) {
      course.sections.forEach((section) => {
        if (section.lectures) {
          totalLectures += section.lectures.length;
        }
      });
    }

    // Convert string lectureId to ObjectId safely
    const lectureObjectId = new mongoose.Types.ObjectId(lectureId);

    // Check if already completed
    const alreadyCompleted = enrollment.completed_lectures.some(
      (id) => id.toString() === lectureObjectId.toString()
    );

    if (!alreadyCompleted) {
      enrollment.completed_lectures.push(lectureObjectId);
    }

    if (totalLectures > 0) {
      enrollment.progress = Math.round(
        (enrollment.completed_lectures.length / totalLectures) * 100
      );
    }

    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';

      // Auto-generate certificate upon completion
      const existingCert = await Certificate.findOne({
        student: enrollment.student,
        course: enrollment.course,
      });

      if (!existingCert) {
        // Fetch user data to pass required certificate fields
        const student = await User.findById(enrollment.student);

        const randomCode = 'NP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        
        await Certificate.create({
          student: enrollment.student,
          course: enrollment.course,
          student_name: student?.full_name || student?.name || req.user.full_name || 'Student',
          student_email: student?.email || req.user.email,
          course_title: course.title,
          course_title_ar: course.title_ar || '',
          instructor: course.instructor || 'Noor Academy Instructor',
          category: course.category || 'General',
          certificate_code: randomCode,
          issue_date: new Date(),
        });
      }
    }

    await enrollment.save();

    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending enrollments awaiting receipt verification
// @route   GET /api/admin/enrollments/pending
// @access  Private/Admin
export const getPendingEnrollments = async (req, res) => {
  try {
    const pending = await Enrollment.find({ status: 'pending_approval' })
      .populate('student', 'full_name name email phone')
      .populate('course', 'title title_ar price')
      .sort({ 'payment_proof.uploaded_at': -1 });

    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve student enrollment
// @route   PUT /api/admin/enrollments/:id/approve
// @access  Private/Admin
export const approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment record not found' });
    }

    enrollment.status = 'active';
    enrollment.payment_status = 'completed';
    enrollment.approved_by = req.user._id;
    enrollment.approved_at = new Date();

    await enrollment.save();
    res.status(200).json({ message: 'Enrollment approved successfully', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject student enrollment
// @route   PUT /api/admin/enrollments/:id/reject
// @access  Private/Admin
export const rejectEnrollment = async (req, res) => {
  try {
    const { reason } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment record not found' });
    }

    enrollment.status = 'rejected';
    enrollment.payment_status = 'rejected';
    enrollment.rejection_reason = reason || 'Payment receipt verification failed.';

    await enrollment.save();
    res.status(200).json({ message: 'Enrollment rejected', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overall stats for Admin Dashboard
// @route   GET /api/enrollments/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [studentsCount, coursesCount, enrollmentsCount, certificatesCount, pendingCount] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Course.countDocuments({}),
      Enrollment.countDocuments({}),
      Certificate.countDocuments({}),
      Enrollment.countDocuments({ status: 'pending_approval' }),
    ]);

    const recentEnrollments = await Enrollment.find({})
      .populate('student', 'full_name name email')
      .populate('course', 'title title_ar')
      .sort({ enrolled_date: -1 })
      .limit(10);

    res.status(200).json({
      stats: {
        students: studentsCount,
        courses: coursesCount,
        enrollments: enrollmentsCount,
        certificates: certificatesCount,
        pendingApprovals: pendingCount,
      },
      recentEnrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};