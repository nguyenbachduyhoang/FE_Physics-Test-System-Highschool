import React from "react";
import Home from "./pages/Home/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";
import PhysicsTestSystem from "./pages/Quiz";
import ThiMau from "./pages/ThiMau";
import Layout from "./components/layout";
import Result from "./pages/Result";
import History from "./pages/History";
import Users from "./pages/Admin/users";
import Questions from "./pages/Admin/questions";
import Exams from "./pages/Admin/exams";
import Reports from "./pages/Admin/reports";
import AdminDashboard from "./pages/Admin/dashboard";
import AdminLayout from "./pages/Admin/AdminLayout";
import TestAPIPage from "./pages/Admin/test-api";
import EssayManagement from "./pages/Admin/essays";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import { Toaster } from "react-hot-toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthRedirect>
        <Login />
      </AuthRedirect>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthRedirect>
        <Login />
      </AuthRedirect>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <AdminDashboard /> }, 
      { path: "dashboard", element: <AdminDashboard /> }, 
      { path: "users", element: <Users /> }, 
      { path: "questions", element: <Questions /> }, 
      { path: "essays", element: <EssayManagement /> },
      { path: "exams", element: <Exams /> }, 
      { path: "reports", element: <Reports /> },
      { path: "test-api", element: <TestAPIPage /> }, 
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "quiz",
        element: <PhysicsTestSystem />,
      },
      {
        path: "quiz/:examId",
        element: <PhysicsTestSystem />,
      },
      {
        path: "thiMau",
        element: <ThiMau />,
      },
      {
        path: "result",
        element: <Result />,
      },
      {
        path: "history",
        element: <History />,
      },
    ],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
