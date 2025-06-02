import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Physics Test System</div>
      <ul className="navbar-menu">
        <li className="active">Trang chủ</li>
        <li>Tạo đề thi</li>
        <li>Ngân hàng câu hỏi</li>
        <li>Lịch sử</li>
      </ul>
      <div className="navbar-actions">
        <div className="navbar-search">
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
        <div className="navbar-avatar">
          <img 
            src="/path/to/avatar.png" 
            alt="Avatar" 
            className="avatar-image" 
          />
          <div className="avatar-dropdown">
            <ul>
              <li>Thông tin cá nhân</li>
              <li>Đăng xuất</li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;