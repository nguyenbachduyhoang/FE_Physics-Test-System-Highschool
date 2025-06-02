import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h3>Lọc đề thi</h3>
      <div className="filter-group">
        <label>Lớp:</label>
        <select>
          <option>10</option>
          <option>11</option>
          <option>12</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Chủ đề:</label>
        <select>
          <option>Cơ học</option>
          <option>Điện học</option>
        </select>
      </div>
      <button className="generate-btn">Tạo đề ngẫu nhiên</button>
    </aside>
  );
};

export default Sidebar;