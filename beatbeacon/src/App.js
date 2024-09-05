import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/common/layout";
import Feed from "./components/home/Feed"; // Import the Feed component
import Page404 from "./components/common/page404";
import { SearchResults } from "./components/common/spotifyDisplay";

import Map from "./pages/map";
import Login from "./pages/login";
import Landing from "./pages/landing";

class App extends React.Component {
  render() {
    const router = createBrowserRouter([
      {
        element: <Layout />,
        errorElement: <Page404 />,
        children: [
          {
            path: "/",
            element: <Landing />,
          },
          {
            path: "/map", // Define the route for the Feed page
            element: <Map />,
          },
          {
            path: "/feed", // Define the route for the Feed page
            element: <Feed />,
          },
          {
            path: '/login',
            element: <Login />
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