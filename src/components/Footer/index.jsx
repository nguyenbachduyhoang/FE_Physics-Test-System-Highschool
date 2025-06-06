import React from "react";
import "./index.scss";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

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
        <li>Hướng dẫn sử dụng</li>
        <li>Câu hỏi thường gặp</li>
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
            <b>support@phygen.vn</b>
          </span>
        </li>
        <li>
          <PhoneOutlined className="footer-icon" />
          <span>1900 1234</span>
        </li>
        <li>
          <EnvironmentOutlined className="footer-icon" />
          <span>TP Hồ Chí Minh</span>
        </li>
      </ul>
    </div>
  </div>
);

export default Footer;
