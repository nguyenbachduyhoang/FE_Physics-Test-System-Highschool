import { Outlet } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import "./index.scss";
function Layout() {
  return (
    <div className="layout-container">
      <Header />
      <div className="layout-content">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
export default Layout;


