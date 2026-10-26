import Enrollment from '../models/EnrollmentModel.js';
import Certificate from '../models/CertificateModel.js';

// @desc    Get student dashboard stats, enrollments, and certificates
// @route   GET /api/dashboard/stats
// @access  Private (Student)
export const getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Fetch student enrollments (active, pending_approval, rejected, completed)
    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course')
      .sort({ enrolled_date: -1 });

    // 2. Fetch student certificates
    const certificates = await Certificate.find({ student: studentId })
      .sort({ issue_date: -1 });

    // 3. Format enrollments with explicit status tracking
    const formattedEnrollments = enrollments.map((enr) => {
      const course = enr.course || {};

      // Calculate total course lessons across sections
      let totalLessons = 0;
      if (course.sections && Array.isArray(course.sections)) {
        course.sections.forEach((sec) => {
          if (sec.lectures) totalLessons += sec.lectures.length;
        });
      }

      return {
        id: enr._id,
        course_id: course._id,
        course_title: course.title || '',
        course_title_ar: course.title_ar || '',
        progress: enr.progress || 0,
        status: enr.status, // 'active', 'pending_approval', 'rejected', 'completed'
        payment_status: enr.payment_status || 'pending',
        rejection_reason: enr.rejection_reason || '',
        completed_lessons: enr.completed_lectures ? enr.completed_lectures.length : 0,
        total_lessons: totalLessons || 20,
      };
    });

    // 4. Format certificates
    const formattedCertificates = certificates.map((cert) => ({
      id: cert._id,
      course_title: cert.course_title,
      course_title_ar: cert.course_title_ar,
      certificate_number: cert.certificate_code,
      issue_date: new Date(cert.issue_date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
    }));

    res.status(200).json({
      enrollments: formattedEnrollments,
      certificates: formattedCertificates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};