import React, {useEffect, useState} from "react";
import { Outlet } from "react-router-dom";
import "./AdminLayout.scss";
import AdminSidebar from "../../components/Sidebar";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function AdminLayout() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchRole = async () => {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setRole(userSnap.data().role);
                }
            }
        };
        fetchRole();
    }, []);

    if (role !== "admin") {
        return <div>Bạn không có quyền truy cập trang này.</div>;
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
                    <Outlet />
                </main>
            </div>
        </div>
    );
}