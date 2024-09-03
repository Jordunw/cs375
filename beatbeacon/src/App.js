import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/common/layout";
import IndexContent from "./components/home/indexContent";
import Feed from "./components/home/Feed"; // Import the Feed component
import Page404 from "./components/common/page404";
import "./App.css";
import LoginPage from "./components/home/login";
import { SearchResults } from "./components/common/spotifyDisplay";

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
          {
            path: "/feed", // Define the route for the Feed page
            element: <Feed />,
          },
          {
            path: '/login',
            element: <LoginPage />
          },
          {
            path: "/logout",
            element: <></>
          },
          {
            path: "/test",
            element: <SearchResults queryStr='gabrielle' width={300} height={200}/>
          }
        ],
      },
    ]);

    return <RouterProvider router={router} />;
  }
}

export default App;