import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2024 PhyGen - Công cụ tạo đề thi Vật Lý</p>
        <div className="links">
          <a href="#">Liên hệ</a>
          <a href="#">Hướng dẫn</a>
        </div>
      </div>
      <div className="social-media">
        <a href="#" className="social-icon">Facebook</a>
        <a href="#" className="social-icon">Twitter</a>
        <a href="#" className="social-icon">Instagram</a>
      </div>
    </footer>
  );
};

export default Footer;