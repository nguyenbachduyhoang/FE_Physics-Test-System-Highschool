import React from 'react';
import './Sidebar.scss';
import { FaFilter, FaPlusCircle, FaDownload, FaSave, FaShareAlt } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="header">
        <FaFilter className="icon" />
        <h3>Lọc đề thi</h3>
      </div>

      <div className="filter-group">
        <label>Chọn lớp</label>
        <select>
          <option value="">Chọn lớp</option>
          <option value="10">Lớp 10</option>
          <option value="11">Lớp 11</option>
          <option value="12">Lớp 12</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Chủ đề</label>
        <select>
          <option value="">Chủ đề</option>
          <option value="co-hoc">Cơ học</option>
          <option value="dien-hoc">Điện học</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Độ khó</label>
        <select>
          <option value="">Đề</option>
          <option value="de-1">Dễ</option>
          <option value="de-2">Trung bình</option>
          <option value="de-3">Khó</option>
        </select>
      </div>

      <button className="generate-btn">Xem đề thi mẫu</button>

      <div className="recent-activity">
        <h4>🟢 Hoạt động gần đây</h4>
        <ul>
          <li><FaPlusCircle className="icon" /> Đã tạo đề thi Cơ học - Lớp 10 (5 phút trước)</li>
          <li><FaDownload className="icon" /> Đã xuất đề thi Điện học - Lớp 11 (15 phút trước)</li>
          <li><FaSave className="icon" /> Đã lưu đề thi Quang học - Lớp 12 (1 giờ trước)</li>
          <li><FaShareAlt className="icon" /> Đã chia sẻ đề thi với đồng nghiệp (2 giờ trước)</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
