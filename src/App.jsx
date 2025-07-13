import React from "react";
import Home from "./pages/Home/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";
import PhysicsTestSystem from "./pages/Quiz";
import ThiMau from "./pages/SampleTest";
import Layout from "./components/layout";
import Result from "./pages/Result";
import History from "./pages/History";
import Users from "./pages/Admin/users";
import UserDetail from "./pages/Admin/users/detail";
import Questions from "./pages/Admin/questions";
import QuestionDetail from "./pages/Admin/questions/detail";
import Exams from "./pages/Admin/exams";
import ExamDetail from "./pages/Admin/exams/detail";
import Reports from "./pages/Admin/reports";
import AdminDashboard from "./pages/Admin/dashboard";
import AdminLayout from "./pages/Admin/AdminLayout";
import TestAPIPage from "./pages/Admin/test-api";
// import EssayManagement from "./pages/Admin/essays";
import NotificationManagement from "./pages/Admin/notifications";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
// import DebugInfo from "./components/DebugInfo";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./contexts/NotificationContext";
import FAQ from "./pages/FAQ";
import Guide from "./pages/Guide";

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
      { path: "users/:id", element: <UserDetail /> },
      { path: "questions", element: <Questions /> }, 
      { path: "questions/:id", element: <QuestionDetail /> },
      // { path: "essays", element: <EssayManagement /> },
      { path: "exams", element: <Exams /> }, 
      { path: "exams/:id", element: <ExamDetail /> },
      { path: "reports", element: <Reports /> },
      { path: "notifications", element: <NotificationManagement /> },
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
      {
        path: "faq",
        element: <FAQ />,
      },
      {
        path: "guide",
        element: <Guide />,
      },
    ],
  },
]);

const App = () => {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
      <Toaster />
      {/* <DebugInfo /> */}
    </NotificationProvider>
  );
};

export default App;
