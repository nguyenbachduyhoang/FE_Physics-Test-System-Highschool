import React from "react";
import "./Home.scss";
import {
  FaRocket, FaUsers, FaChartLine,
  FaMagic, FaLayerGroup, FaFileExport, FaPlus
} from "react-icons/fa";

const Home = () => {
  return (
    <div className="home-wrapper">
      <div className="main-box">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>🎉 Chào mừng đến với <span>Phygens</span></h2>
          <p>
            Tạo đề thi thông minh, nhanh chóng và chính xác với công nghệ AI.
            <br />
            PhyGen giúp bạn tiết kiệm thời gian và nâng cao hiệu quả giảng dạy.
          </p>
          <button className="create-button">
            <FaPlus /> Tạo đề mới
          </button>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-box">
            <FaRocket />
            <div>
              <h3>14,700+</h3>
              <p>Đề thi đã tạo</p>
            </div>
          </div>
          <div className="stat-box">
            <FaUsers />
            <div>
              <h3>2,450+</h3>
              <p>Giáo viên tin dùng</p>
            </div>
          </div>
          <div className="stat-box">
            <FaChartLine />
            <div>
              <h3>97%</h3>
              <p>Độ chính xác AI</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          <h3>⭐ Tính năng nổi bật</h3>
          <div className="features">
            <div className="feature-box">
              <FaMagic />
              <h4>AI Thông Minh</h4>
              <p>Tạo câu hỏi đa dạng, phù hợp với chương trình học</p>
            </div>
            <div className="feature-box">
              <FaLayerGroup />
              <h4>Phân Loại Độ Khó</h4>
              <p>6 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao</p>
            </div>
            <div className="feature-box">
              <FaMagic />
              <h4>AI Thông Minh</h4>
              <p>Tạo câu hỏi đa dạng, phù hợp với chương trình học</p>
            </div>
            <div className="feature-box">
              <FaFileExport />
              <h4>Xuất Đa Định Dạng</h4>
              <p>Xuất file PDF, Word, LaTeX chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
