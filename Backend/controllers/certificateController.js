import Certificate from '../models/CertificateModel.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Generate a certificate upon course completion
// @route   POST /api/certificates
// @access  Private (Student)
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id; // From auth middleware
    const studentName = req.user.full_name || req.user.name || 'Student';
    const studentEmail = req.user.email;

    // 1. Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2. Check if certificate already exists for this student & course
    const existingCert = await Certificate.findOne({ student: studentId, course: courseId });
    if (existingCert) {
      return res.status(200).json(existingCert);
    }

    // 3. Generate unique certificate code (e.g., NPA-ENG-84920)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const prefix = course.category ? course.category.substring(0, 3).toUpperCase() : 'NPA';
    const certificate_code = `NPA-${prefix}-${randomNum}`;

    // 4. Create new certificate record with all required schema fields
    const newCertificate = await Certificate.create({
      student: studentId,
      course: courseId,
      student_name: studentName,
      student_email: studentEmail,
      course_title: course.title,
      course_title_ar: course.title_ar || '',
      instructor: course.instructor || 'Noor Academy Instructor',
      category: course.category || 'General',
      certificate_code,
      certificate_template: course.certificate_image || '',
    });

    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all certificates (Admin view)
// @route   GET /api/certificates
// @access  Private/Admin
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({})
      .populate('student', 'full_name name email')
      .populate('course', 'title title_ar category')
      .sort({ issue_date: -1 });

    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify a certificate by code (Public lookup)
// @route   GET /api/certificates/verify/:code
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    const certificate = await Certificate.findOne({ certificate_code: code.toUpperCase() });

    if (!certificate) {
      return res.status(404).json({ valid: false, message: 'Invalid or non-existent certificate code.' });
    }

    res.status(200).json({
      valid: true,
      certificate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all certificates earned by the currently logged-in student
// @route   GET /api/certificates/my-certificates
// @access  Private (Student)
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'instructor category certificate_image')
      .sort({ issue_date: -1 });

    // Map output to match frontend props (e.g. certificate_number)
    const formattedCerts = certificates.map((cert) => {
      const course = cert.course || {};
      return {
        id: cert._id,
        course_id: course._id || cert.course,
        course_title: cert.course_title,
        course_title_ar: cert.course_title_ar,
        instructor: cert.instructor || course.instructor || 'Prof. Ahmed Nour',
        category: cert.category || course.category || 'Professional Training',
        certificate_template: cert.certificate_template || course.certificate_image || '',
        student_name: cert.student_name,
        certificate_number: cert.certificate_code,
        issue_date: new Date(cert.issue_date).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
      };
    });

    res.status(200).json(formattedCerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};