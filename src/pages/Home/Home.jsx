import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <h1>Chào mừng đến với PhyGen!</h1>
      <p>Công cụ tạo đề thi Vật Lý tự động.</p>
      <div className="quick-actions">
        <button>Tạo đề mới</button>
        <button>Xem đề mẫu</button>
      </div>
    </div>
  );
};

export default Home;