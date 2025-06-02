// App.jsx
import React from "react";
import Header from "./components/common/Header/Header";
import Navbar from "./components/layout/Navbar/Navbar";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import Home from "./pages/Home/Home";
import Footer from "./components/common/Footer/Footer";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";

const Layout = ({ children }) => {
  return (
    <div className="app">
      <Header />
      <Navbar />
      <div className="main-layout">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="content-area">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
