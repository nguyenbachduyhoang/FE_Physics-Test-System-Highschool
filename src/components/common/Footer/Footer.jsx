import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3 className="footer-title">Phygen</h3>
          <p className="footer-text">Công cụ tạo đề thi Vật lý thông minh, hỗ trợ giáo viên nâng cao chất lượng giảng dạy.</p>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Sản phẩm</h4>
          <ul className="footer-list">
            <li>Tạo đề thi</li>
            <li>Ngân hàng câu hỏi</li>
            <li>Phân tích kết quả</li>
            <li>API tích hợp</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Hỗ trợ</h4>
          <ul className="footer-list">
            <li>Hướng dẫn sử dụng</li>
            <li>Câu hỏi thường gặp</li>
            <li>Liên hệ</li>
            <li>Báo lỗi</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Liên hệ</h4>
          <ul className="footer-list">
            <li>📧 support@phygen.vn</li>
            <li>📞 1900 1234</li>
            <li>📍 TP Hồ Chí Minh</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
