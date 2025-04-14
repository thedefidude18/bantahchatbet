import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_CREDENTIALS, ADMIN_CONFIG } from '../constants/adminConfig';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  admin: { email: string; name: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      const session = JSON.parse(adminSession);
      const now = new Date().getTime();
      
      if (now < session.expiresAt) {
        setIsAuthenticated(true);
        setAdmin({ email: session.email, name: session.name });
      } else {
        localStorage.removeItem('adminSession');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const adminUser = ADMIN_CREDENTIALS.credentials.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (adminUser) {
      const session = {
        email: adminUser.email,
        name: adminUser.name,
        expiresAt: new Date().getTime() + ADMIN_CONFIG.sessionDuration,
      };
      localStorage.setItem('adminSession', JSON.stringify(session));
      setIsAuthenticated(true);
      setAdmin({ email: adminUser.email, name: adminUser.name });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};