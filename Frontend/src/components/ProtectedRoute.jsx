import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#f8fcfb]">
    <div className="w-8 h-8 border-4 border-[#009688]/20 border-t-[#009688] rounded-full animate-spin" />
  </div>
);

export default function ProtectedRoute({ 
  fallback = <DefaultFallback />, 
  unauthenticatedElement = <Navigate to="/login" replace /> 
}) {
  const { isAuthenticated, isLoadingAuth, authError } = useAuth();

  // Check persistent storage directly
  const isLoggedInStorage = localStorage.getItem('is_logged_in') === 'true' || Boolean(localStorage.getItem('noor_user'));

  if (isLoadingAuth) {
    return fallback;
  }

  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Grant access if either state or localStorage is true
  if (isAuthenticated || isLoggedInStorage) {
    return <Outlet />;
  }

  return unauthenticatedElement;
}