import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/common/layout";
import IndexContent from "./components/home/indexContent";
import Page404 from "./components/common/page404";
import "./App.css";

class App extends React.Component {
  render() {
    const router = createBrowserRouter([
      {
        element: <Layout />,
        errorElement: <Page404 />,
        children: [
          {
            path: "/",
            element: <IndexContent />,
          },
        ],
      },
    ]);

    return <RouterProvider router={router} />;
  }
}

export default App;
