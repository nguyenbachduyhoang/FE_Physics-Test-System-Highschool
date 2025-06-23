import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Nếu chưa đăng nhập, chuyển về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu cần role cụ thể và user không có role đó
  if (requiredRole && user?.role !== requiredRole) {
    // Nếu user không phải admin nhưng cố truy cập admin route
    if (requiredRole === 'admin') {
      return <Navigate to="/home" replace />;
    }
    // Các trường hợp khác có thể redirect về trang phù hợp
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute; 