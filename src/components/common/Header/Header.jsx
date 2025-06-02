import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">PhyGen</div>
      <div className="user-info">
        <span>Xin chào, Giáo viên!</span>
        <div className="avatar">👩🏫</div>
      </div>
    </header>
  );
};

export default Header;