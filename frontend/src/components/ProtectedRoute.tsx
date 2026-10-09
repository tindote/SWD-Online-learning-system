import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="state-card" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const isRestricted = location.pathname.startsWith('/admin') || location.pathname.startsWith('/instructor');
    return <Navigate to="/login" state={isRestricted ? undefined : { from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') {
      return <Navigate to="/" replace />;
    }
    if (user.role === 'instructor') {
      return <Navigate to="/instructor/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};
