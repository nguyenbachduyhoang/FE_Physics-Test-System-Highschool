import React from "react";
import { Divider, Input } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import {
  HomeOutlined,
  FileTextOutlined,
  BankOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./index.scss";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="header-container">
      <div className="header-left">
        <Link to="/home">
          <img src="/logo/33.png" alt="Logo 1" className="header-logo" />
        </Link>
        <Divider type="vertical" className="header-divider" />
        <span className="header-title">Physics Test System</span>
      </div>
      <div className="header-menu">
        <Link to="/home" className="header-menu-item" style={{ textDecoration: 'none' }}>
          <HomeOutlined />
          <span>Trang chủ</span>
        </Link>
        <Divider type="vertical" className="header-divider" />
        <span className="header-menu-item">
          <Link to="/home" className="header-menu-item" style={{ textDecoration: 'none' }}>
            <FileTextOutlined />
            <span>Tạo đề thi</span>
          </Link>
        </span>
        <Divider type="vertical" className="header-divider" />
        <span className="header-menu-item">
          <BankOutlined />
          <span>Ngân hàng câu hỏi</span>
        </span>
        <Divider type="vertical" className="header-divider" />
        <span className="header-menu-item">
          <Link to="/history" className="header-menu-item" style={{ textDecoration: 'none' }}>
            <CalendarOutlined />
            <span>Lịch sử</span>
          </Link>
        </span>
      </div>
      <div className="header-actions">
        <div className="header-search">
          <Input
            className="header-search-input"
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm"
          />
        </div>
        <div className="logout-button" onClick={() => navigate("/")}>
          <LogoutOutlined />
        </div>
      </div>
    </div>
  );
};

export default Header;
