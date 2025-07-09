import React from "react";
import "./index.scss";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const Footer = () => (
  <div className="footer">
    <div className="footer-col">
      <div className="footer-title brand">Phygens</div>
      <div className="footer-desc">
        Công cụ tạo đề thi Vật lý thông minh, hỗ trợ giáo viên nâng cao chất
        lượng giảng dạy.
      </div>
    </div>
    <div className="footer-col">
      <div className="footer-title">Sản phẩm</div>
      <ul className="footer-list">
        <li>Tạo đề thi</li>
        <li>Ngân hàng câu hỏi</li>
        <li>Phân tích kết quả</li>
        <li>API tích hợp</li>
      </ul>
    </div>
    <div className="footer-col">
      <div className="footer-title">Hỗ trợ</div>
      <ul className="footer-list">
        <li>
          <span>
            <a href="/guide">Hướng dẫn sử dụng</a>
          </span>
        </li>
        <li>
          <span>
            <a href="/faq">Câu hỏi thường gặp</a>
          </span>
        </li>
        <li>Liên hệ</li>
        <li>Báo lỗi</li>
      </ul>
    </div>
    <div className="footer-col">
      <div className="footer-title">Liên hệ</div>
      <ul className="footer-contact">
        <li>
          <MailOutlined className="footer-icon" />
          <span>
            <a href="mailto:support@phygen.vn">support@phygen.vn</a>
          </span>
        </li>
        <li>
          <PhoneOutlined className="footer-icon" />
          <span>
            <a href="tel:19001234" style={{ marginRight: 8 }}>1900 1234</a>
            <a href="https://wa.me/19001234" target="_blank" rel="noopener noreferrer" title="Chat qua WhatsApp">🟢</a>
          </span>
        </li>
        <li>
          <EnvironmentOutlined className="footer-icon" />
          <span>
            <a href="https://bom.so/EBar04" target="_blank" rel="noopener noreferrer">TP Hồ Chí Minh</a>
          </span>
        </li>
      </ul>
    </div>
  </div>
);

export default Footer;
