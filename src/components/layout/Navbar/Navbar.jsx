import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li className="active">Trang chủ</li>
        <li>Tạo đề thi</li>
        <li>Ngân hàng câu hỏi</li>
        <li>Lịch sử</li>
      </ul>
    </nav>
  );
};

export default Navbar;