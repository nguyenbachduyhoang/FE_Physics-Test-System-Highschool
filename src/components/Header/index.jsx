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
import { authService } from "../../services/authService";
import NotificationBell from "../NotificationBell";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate("/"); // Redirect to login page after logout
  };

  return (
    <div className="header-container">
      <div className="header-left">
        <Link to="/home">
          <img src="/images/33.png" alt="Logo 1" className="header-logo" />
        </Link>
        <Divider type="vertical" className="header-divider" />
        <span className="header-title">Physics Test System</span>
      </div>
      <div className="header-menu">
        <Link to="/home" className="header-menu-item" style={{ textDecoration: 'none' }}>
          <HomeOutlined />
          <span>Trang chủ</span>
        </Link>
        {/* <Divider type="vertical" className="header-divider" /> */}
        {/* <span className="header-menu-item">
          <Link to="/home" className="header-menu-item" style={{ textDecoration: 'none' }}>
            <FileTextOutlined />
            <span>Tạo đề thi</span>
          </Link>
        </span> */}
        <Divider type="vertical" className="header-divider" />
        <span className="header-menu-item">
        <Link to="/thiMau" className="header-menu-item" style={{ textDecoration: 'none' }}>
          <BankOutlined />
          <span>Xem đề thi mẫu</span>
          </Link>
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
        <NotificationBell />
        <div className="logout-button" onClick={handleLogout}>
          <LogoutOutlined />
        </div>
      </div>
    </div>
  );
};

export default Header;
