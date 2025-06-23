// components/AdminSidebar/AdminSidebar.jsx
import React, { useState } from "react";
import { Menu, Button } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined, // thêm dòng này
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./index.scss";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      path: "/admin",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      path: "/admin/users",
    },
    {
      key: "questions",
      icon: <QuestionCircleOutlined />,
      label: "Ngân hàng câu hỏi",
      path: "/admin/questions",
    },
    {
      key: "exams",
      icon: <FileTextOutlined />,
      label: "Quản lý đề thi",
      path: "/admin/exams",
    },
    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: "Thống kê & Báo cáo",
      path: "/admin/reports",
    },
   
  ];

  // Xác định key đang active dựa vào location
  const getActiveKey = () => {
    // Sắp xếp path dài nhất trước để tránh /admin khớp hết mọi thứ
    const sorted = [...menuItems].sort((a, b) => b.path.length - a.path.length);
    const found = sorted.find((item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/"));
    return found ? found.key : "dashboard";
  };

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((item) => item.key === key);
    if (item) navigate(item.path);
  };

  return (
    <div className={`admin-sidebar-antd ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-content">
          {!collapsed && (
            <div className="logo-text">
              <div className="logo-title">PhyGen</div>
              <div className="logo-subtitle">Admin Panel</div>
            </div>
          )}
        </div>

        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle"
          size="large"
          style={{ color: "white" }}
        />
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        <Menu
          mode="inline"
          selectedKeys={[getActiveKey()]}
          inlineCollapsed={collapsed}
          items={menuItems}
          onClick={handleMenuClick}
          theme="light"
          className="custom-menu"
        />
      </div>


      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="footer-version">
            <span>PhyGen v2.1</span>
          </div>
          <div className="footer-copyright">© 2025 Physics Exam Generator</div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
