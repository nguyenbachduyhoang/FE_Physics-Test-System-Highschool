import React, {useState} from "react";
import { Outlet } from "react-router-dom";
import "./AdminLayout.scss";
import AdminSidebar from "../../components/Sidebar";

export default function AdminLayout() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="admin-layout">
      <div className="admin-dashboard-layout">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 