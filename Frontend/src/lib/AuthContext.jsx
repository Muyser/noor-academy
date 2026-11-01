import { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Read saved user or default to null (NO HARDCODED DEFAULT DATA)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('noor_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_logged_in') === 'true' && Boolean(localStorage.getItem('noor_user'));
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);

  // Sync state if localStorage changes
  useEffect(() => {
    const loggedIn = localStorage.getItem('is_logged_in') === 'true';
    const savedUser = localStorage.getItem('noor_user');
    
    if (loggedIn && savedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  // Helper method so Login and Register pages can update AuthContext state immediately
  const setAuthUser = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (userData) {
      localStorage.setItem('noor_user', JSON.stringify(userData));
      localStorage.setItem('is_logged_in', 'true');
    }
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    
    try {
      const res = await base44.auth.loginViaEmailPassword(email, password).catch(() => null);
      if (res?.access_token) {
        base44.auth.setToken(res.access_token);
      }
    } catch (e) {
      console.warn('Backend connection bypassed');
    }

    setIsLoadingAuth(false);
    setAuthChecked(true);
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('noor_user');
    localStorage.removeItem('token');
    localStorage.removeItem('base44_token');

    try {
      base44.auth.logout();
    } catch {}

    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const checkUserAuth = async () => {
    const savedUser = localStorage.getItem('noor_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {}
    }
    setAuthChecked(true);
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
        setAuthUser, // Expose setAuthUser so Login/Register can push state instantly
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