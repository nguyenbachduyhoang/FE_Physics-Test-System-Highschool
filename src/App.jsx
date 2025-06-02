// App.jsx
import React from 'react';
import Header from './components/common/Header/Header';
import Navbar from './components/layout/Navbar/Navbar';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Footer from './components/common/Footer/Footer';
import './App.css';

const App = () => {
  return (
    <div className="app">
      <Header />
      <Navbar />
      <div className="main-layout">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="content-area">
          <Home />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;