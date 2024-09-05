import { Outlet } from "react-router-dom";
import React from "react";
import Sidebar from "../home/sidebar";

export default function Layout() {
  const handleLoginClick = () => {
    const width = 500, height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);

    window.open(
      "https://accounts.spotify.com/authorize", 
      "Spotify Login", 
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  return (
    <div className="layout-container">
      <div className="header">BeatBeacon</div>
      <Sidebar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
