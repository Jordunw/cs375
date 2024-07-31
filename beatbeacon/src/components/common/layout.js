import { Outlet } from "react-router-dom";

// Default layout for pages
// Outlet will be all of the other content provided to a page in the children section of App.js
export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}
