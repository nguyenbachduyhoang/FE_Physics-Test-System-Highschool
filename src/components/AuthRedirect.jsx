import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthRedirect = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  console.log('AuthRedirect - isAuthenticated:', isAuthenticated);
  console.log('AuthRedirect - user:', user);
  console.log('AuthRedirect - user role:', user?.role);

  // Nếu đã đăng nhập, redirect đến trang phù hợp
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      console.log('Redirecting admin to /admin');
      return <Navigate to="/admin" replace />;
    } else {
      console.log('Redirecting student to /home');
      return <Navigate to="/home" replace />;
    }
  }

  console.log('Not authenticated, showing login page');
  // Nếu chưa đăng nhập, hiển thị trang login
  return children;
};

export default AuthRedirect; 