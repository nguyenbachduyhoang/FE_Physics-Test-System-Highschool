import React from "react";
import "./Home.scss";
import {
  FaRocket,
  FaUsers,
  FaChartLine,
  FaMagic,
  FaLayerGroup,
  FaFileExport,
  FaPlus,
  FaFilter,
  FaChalkboardTeacher,
  FaBookOpen,
} from "react-icons/fa";
import { BsQuestionDiamond, BsClock } from "react-icons/bs";
import Cselect from "../../components/uiBasic/Cselect";
import { Divider, Modal, Switch } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutContent from "../../components/layoutContent";

const mockData = {
  filters: {
    classes: [
      { label: "Lớp 10", value: "10" },
      { label: "Lớp 11", value: "11" },
      { label: "Lớp 12", value: "12" },
    ],
    topics: [
      { label: "Cơ học", value: "cohoc" },
      { label: "Điện học", value: "dienhoc" },
      { label: "Quang học", value: "quanghoc" },
    ],
    levels: [
      { label: "Dễ", value: "easy" },
      { label: "Trung bình", value: "medium" },
      { label: "Khó", value: "hard" },
    ],
  },
  stats: [
    { icon: <FaRocket />, value: "14,700+", label: "Đề thi đã tạo" },
    { icon: <FaUsers />, value: "2,450+", label: "Giáo viên tin dùng" },
    { icon: <FaChartLine />, value: "97%", label: "Độ chính xác AI" },
  ],
  features: [
    {
      icon: <FaMagic />,
      title: "AI Thông Minh",
      desc: "Tạo câu hỏi đa dạng, phù hợp với từng chương trình học",
    },
    {
      icon: <FaLayerGroup />,
      title: "Phân Loại Độ Khó",
      desc: "4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao",
    },
    {
      icon: <FaMagic />,
      title: "AI Thông Minh",
      desc: "Tạo câu hỏi đa dạng, phù hợp với từng chương trình học",
    },
    {
      icon: <FaFileExport />,
      title: "Xuất Đa Định Dạng",
      desc: "Xuất file PDF, Word, LaTeX chuyên nghiệp",
    },
  ],
  recent: [
    {
      icon: <FaRocket />,
      text: "Đã tạo đề thi Cơ học - Lớp 10 (5 phút trước)",
    },
    {
      icon: <FaFileExport />,
      text: "Đã xuất đề thi Điện học - Lớp 11 (15 phút trước)",
    },
    {
      icon: <FaMagic />,
      text: "Đã lưu đề thi Quang học - Lớp 12 (1 giờ trước)",
    },
    {
      icon: <FaUsers />,
      text: "Đã chia sẻ đề thi với đồng nghiệp (2 giờ trước)",
    },
  ],
};

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="layout-home">
      <LayoutContent
        layoutType={5}
        content1={
          <>
            <h3 className="home-sidebar-title">
              <FaFilter className="home-sidebar-icon" />
              Lọc đề thi
            </h3>
            <div className="home-sidebar-input">
              <Cselect
                label="Chọn lớp"
                options={mockData.filters.classes}
                prefix={<FaChalkboardTeacher />}
              />
            </div>
            <div className="home-sidebar-input">
              <Cselect
                label="Chủ đề"
                options={mockData.filters.topics}
                prefix={<FaBookOpen style={{ color: "#2DD4BF" }} />}
              />
            </div>
            <div className="home-sidebar-input">
              <Cselect
                label="Độ khó"
                options={mockData.filters.levels}
                prefix={<BsQuestionDiamond />}
              />
            </div>
            <button
              className="home-sidebar-btn"
              onClick={() => navigate("/thiMau")}
            >
              Xem đề thi mẫu
            </button>
            <div className="home-sidebar-recent">
              <h3 className="home-sidebar-recent-title">
                <BsClock />
                Hoạt động gần đây
              </h3>
              <ul className="home-sidebar-recent-list">
                {mockData.recent.map((item, idx) => (
                  <li className="home-sidebar-recent-item" key={idx}>
                    <span className="home-sidebar-recent-icon">
                      {item.icon}
                    </span>
                    <span className="home-sidebar-recent-text">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        }
        content2={
          <>
            <div className="home-main-welcome">
              <h1 className="home-main-welcome-title">
                <FaLayerGroup className="home-main-welcome-icon" />
                Chào mừng đến với{" "}
                <span className="home-main-welcome-brand">Phygens</span>
              </h1>
              <p className="home-main-welcome-desc">
                Tạo đề thông minh, nhanh chóng và chính xác với công nghệ.PhyGen
                giúp bạn tiết kiệm thời gian và nâng cao hiệu quả.
              </p>
              <button
                className="home-main-welcome-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus className="home-main-welcome-btn-icon" />
                Tạo đề mới
              </button>
            </div>
            <div className="home-main-stats">
              {mockData.stats.map((stat, idx) => (
                <div className="home-main-stat-box" key={idx}>
                  <div className="home-main-stat-icon">{stat.icon}</div>
                  <h3 className="home-main-stat-value">{stat.value}</h3>
                  <p className="home-main-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
            <h3 className="home-main-feature-title">
              <FaMagic className="home-main-feature-icon" />
              Tính năng nổi bật
            </h3>
            <div className="home-main-features">
              {mockData.features.map((feature, idx) => (
                <div className="home-main-feature-box" key={idx}>
                  <div className="home-main-feature-box-icon">
                    {feature.icon}
                  </div>
                  <h4 className="home-main-feature-box-title">
                    {feature.title}
                  </h4>
                  <p className="home-main-feature-box-desc">{feature.desc}</p>
                </div>
              ))}
            </div>
          </>
        }
      />
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        className="custom-create-exam-modal"
        closeIcon={<span style={{ color: "#fff", fontSize: 30 }}>&times;</span>}
      >
        <div>
          <h2 className="modal-title">Thiết lập bài kiểm tra</h2>
          <div className="modal-row">
            <span className="modal-label">Câu hỏi (tối đa 50)</span>
            <input
              className="modal-input"
              type="number"
              min={1}
              max={50}
              defaultValue={10}
            />
          </div>

          <div className="modal-row">
            <span className="modal-label">Trả lời bằng</span>
            <select className="modal-select">
              <option value="both">Cả hai</option>
              <option value="essay">Tự luận</option>
              <option value="mcq">Trắc nghiệm</option>
            </select>
          </div>
          <Divider style={{ background: "white", margin: "8px 0" }} />
          <div className="modal-switch-row">
            <span className="modal-label">Tự luận</span>
            <Switch defaultChecked />
          </div>

          <div className="modal-switch-row">
            <span className="modal-label">Trắc nghiệm</span>
            <Switch defaultChecked />
          </div>

          <div className="modal-btn-row">
            <button className="modal-btn" onClick={() => navigate("/quiz")}>
              <FaRocket /> Bắt đầu làm kiểm tra
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
