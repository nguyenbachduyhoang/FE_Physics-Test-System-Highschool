import React from "react";
import Home from "./pages/Home/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";
import PhysicsTestSystem from "./pages/Quiz";
import ThiMau from "./pages/ThiMau";
import Layout from "./components/layout";
import Result from "./pages/Result";
import History from "./pages/History";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
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
  return <RouterProvider router={router} />;
};

export default App;
