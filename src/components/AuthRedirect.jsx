import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthRedirect = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  // Nếu đã đăng nhập, redirect đến trang phù hợp
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }
  // Nếu chưa đăng nhập, hiển thị trang login
  return children;
};

export default AuthRedirect; 