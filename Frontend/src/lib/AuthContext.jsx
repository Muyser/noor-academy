import { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Read saved session synchronously on mount
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('noor_user');
    return saved ? JSON.parse(saved) : { id: '1', full_name: 'Muyser', email: 'muyser@gmail.com', role: 'student' };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_logged_in') === 'true' || Boolean(localStorage.getItem('noor_user'));
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);

  // Synchronize state with local storage on initial mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('is_logged_in') === 'true';
    if (loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email = 'muyser@gmail.com', password = '1234') => {
    setIsLoadingAuth(true);
    
    try {
      const res = await base44.auth.loginViaEmailPassword(email, password).catch(() => null);
      if (res?.access_token) {
        base44.auth.setToken(res.access_token);
      }
    } catch (e) {
      console.warn('Backend connection bypassed - using active local session');
    }

    const userData = {
      id: '1',
      full_name: 'Muyser',
      email: email || 'muyser@gmail.com',
      role: 'student',
    };

    setUser(userData);
    setIsAuthenticated(true);

    // Save session flags to local storage
    localStorage.setItem('is_logged_in', 'true');
    localStorage.setItem('noor_user', JSON.stringify(userData));
    localStorage.setItem('base44_token', 'mock-token-muyser');

    setIsLoadingAuth(false);
    setAuthChecked(true);
    return userData;
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('noor_user');
    localStorage.removeItem('base44_token');

    try {
      base44.auth.logout();
    } catch {}

    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const checkUserAuth = async () => {
    // If already marked logged in, don't revert to unauthenticated
    if (localStorage.getItem('is_logged_in') === 'true') {
      setIsAuthenticated(true);
      setAuthChecked(true);
      return;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        authChecked,
        login,
        logout,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};