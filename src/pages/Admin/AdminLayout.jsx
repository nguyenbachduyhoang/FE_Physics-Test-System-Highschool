import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import "./AdminLayout.scss";
import AdminSidebar from "../../components/Sidebar";
import { authService } from "../../services/authService";
import NotificationBell from "../../components/NotificationBell";

export default function AdminLayout() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticated = authService.isAuthenticated();
            const currentUser = authService.getCurrentUser();
            
            if (isAuthenticated && currentUser) {
                setUser(currentUser);
            }
            setIsLoading(false);
        };
        
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            // Ngay cả khi có lỗi, vẫn chuyển hướng người dùng về trang login
            navigate('/login', { replace: true });
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="admin-layout-loading">
                <div>Đang kiểm tra quyền truy cập...</div>
            </div>
        );
    }

    // Kiểm tra authentication và role
    if (!authService.isAuthenticated() || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        return (
            <div className="admin-access-denied">
                <div className="access-denied-content">
                    <h2>Không có quyền truy cập</h2>
                    <p>Bạn không có quyền truy cập vào trang quản trị.</p>
                    <button onClick={() => navigate('/home', { replace: true })}>
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

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
                    <div className="admin-header">
                        <h1>Trang Quản Trị</h1>
                        <div className="admin-user-info">
                            <span>Xin chào, {user.fullName || user.username}</span>
                            <NotificationBell />
                            <button 
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}