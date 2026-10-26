import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import SiteLayout from '@/components/SiteLayout';
import DashboardLayout from '@/components/DashboardLayout';
import AdminLayout from '@/components/AdminLayout';

// Public pages
import Home from '@/pages/Home';
import Courses from '@/pages/Courses';
import Languages from '@/pages/Languages';
import CourseDetail from '@/pages/CourseDetail';
import Blog from '@/pages/Blog';
import BlogArticle from '@/pages/BlogArticle';
import FAQPage from '@/pages/FAQPage';
import Gallery from '@/pages/Gallery';
import CertificateVerify from '@/pages/CertificateVerify';
import LevelTest from '@/pages/LevelTest';
import Support from '@/pages/Support';
import PageNotFoundPage from '@/pages/PageNotFound';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Student dashboard pages
import Dashboard from '@/pages/Dashboard';
import MyCourses from '@/pages/MyCourses';
import MyCertificates from '@/pages/MyCertificates';
import Notifications from '@/pages/Notifications';
import Learning from '@/pages/Learning';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEnrollments from '@/pages/admin/AdminEnrollments';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminInstructors from '@/pages/admin/AdminInstructors';
import AdminCertificates from '@/pages/admin/AdminCertificates';
import AdminCourses from '@/pages/admin/AdminCourses';
import AdminLanguages from '@/pages/admin/AdminLanguages';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminFAQ from '@/pages/admin/AdminFAQ';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminStatistics from '@/pages/admin/AdminStatistics';
import AdminSettings from '@/pages/admin/AdminSettings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-brand-line border-t-brand-teal rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public site */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/languages" element={<Languages />} />
        <Route path="/courses" element={<Courses />} />
        
        {/* Course Detail Routes */}
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/courses/:id" element={<CourseDetail />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/certificates/verify" element={<CertificateVerify />} />
        <Route path="/certificates/verify.php" element={<CertificateVerify />} />
        <Route path="/level-test" element={<LevelTest />} />
        <Route path="/support" element={<Support />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected student area */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/courses" element={<MyCourses />} />
          <Route path="/dashboard/certificates" element={<MyCertificates />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/learning" element={<Learning />} />
        </Route>
      </Route>

      {/* Admin area */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/enrollments" element={<AdminEnrollments />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/instructors" element={<AdminInstructors />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/languages" element={<AdminLanguages />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/faq" element={<AdminFAQ />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/statistics" element={<AdminStatistics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<PageNotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;