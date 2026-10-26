import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/EnrollmentModel.js';
import Certificate from '../models/CertificateModel.js';

// @desc    Get live dynamic platform statistics
// @route   GET /api/statistics
// @access  Public
export const getStatistics = async (req, res) => {
  try {
    // 1. Run database queries in parallel for maximum performance
    const [
      studentsCount,
      coursesCount,
      enrollmentsCount,
      certificatesCount,
      completedEnrollmentsCount
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }), // All non-admin users/students
      Course.countDocuments({}),
      Enrollment.countDocuments({}),
      Certificate.countDocuments({}),
      Enrollment.countDocuments({ status: 'completed' }),
    ]);

    // 2. Calculate dynamic completion rate percentage
    let completionRate = 0;
    if (enrollmentsCount > 0) {
      completionRate = Math.round((completedEnrollmentsCount / enrollmentsCount) * 100);
    }

    // 3. Construct dynamic statistics response payload formatted for frontend display
    const dynamicStats = [
      {
        id: 'stat-active-students',
        label: 'Active Students',
        label_ar: 'الطلاب النشطون',
        value: studentsCount,
        icon: 'Users',
        order: 1,
      },
      {
        id: 'stat-completion-rate',
        label: 'Course Completion Rate',
        label_ar: 'نسبة إكمال الدورات',
        value: `${completionRate}%`,
        icon: 'TrendingUp',
        order: 2,
      },
      {
        id: 'stat-verified-certs',
        label: 'Verified Certificates',
        label_ar: 'الشهادات المعتمدة',
        value: certificatesCount,
        icon: 'Award',
        order: 3,
      },
      {
        id: 'stat-published-courses',
        label: 'Published Courses',
        label_ar: 'الدورات المنشورة',
        value: coursesCount,
        icon: 'BookOpen',
        order: 4,
      },
    ];

    res.status(200).json(dynamicStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};