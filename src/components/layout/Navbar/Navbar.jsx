import React from 'react';
import { FaHome, FaFileAlt, FaRegCalendarAlt } from 'react-icons/fa';
import { AiOutlineBank } from 'react-icons/ai';
import './Navbar.scss';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo.png" alt="Logo" />
        Physics Test System
      </div>
      <ul className="navbar-menu">
        <li className="active">
          <FaHome />
          Trang chủ
        </li>
        <li>
          <FaFileAlt />
          Tạo đề thi
        </li>
        <li>
          <AiOutlineBank />
          Ngân hàng câu hỏi
        </li>
        <li>
          <FaRegCalendarAlt />
          Lịch sử
        </li>
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