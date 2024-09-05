import React, { useState } from "react";
import OAuth from "../services/OAuth";
import { Music, PlusCircle, LogIn, LogOut, Flame } from "lucide-react";

function Sidebar({ isLoggedIn, onLoginStatusChange, onAddMarkerMode, isAddingMarker }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await OAuth.openPopupAndAuthenticate();
      console.log(result.message);
      onLoginStatusChange(true);
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    OAuth.logout();
    onLoginStatusChange(false);
  };

  const handleAddMarker = () => {
    onAddMarkerMode(true);
  };

  const sidebarStyle = {
    width: "300px",
    height: "calc(100vh - 60px)",
    marginTop: "60px",
    padding: "20px",
    background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
    borderRight: "1px solid #dee2e6",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
    position: "fixed",
    left: 0,
    zIndex: 1000,
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
  };

  const buttonStyle = {
    padding: '12px 15px',
    marginBottom: '15px',
    width: '100%',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  };

  const addMarkerButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #ff7043, #ff5722)',
    color: 'white',
    boxShadow: '0 2px 5px rgba(255, 87, 34, 0.3)',
  };

  const loginLogoutButtonStyle = {
    ...buttonStyle,
    background: '#ffffff',
    color: '#333',
    border: '1px solid #ff5722',
  };

  const overlayStyle = {
    position: "absolute",
    top: "-8px",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 87, 34, 0.1)",
    backdropFilter: "blur(3px)",
    display: isAddingMarker ? "flex" : "none",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  };

  const titleStyle = {
    color: '#333',
    fontSize: '22px',
    marginBottom: '25px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const iconStyle = {
    marginRight: '10px',
  };

  return (
    <div style={sidebarStyle}>
      <div>
        <h2 style={titleStyle}>
          <Flame size={24} color="#ff5722" />
          Music Markers
        </h2>
        {isLoggedIn && (
          <button 
            style={addMarkerButtonStyle}
            onClick={handleAddMarker}
          >
            <PlusCircle size={18} style={iconStyle} />
            Add Music Marker
          </button>
        )}
        {error && <p style={{ color: '#d32f2f', textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
      </div>
      <div>
        <button 
          style={loginLogoutButtonStyle}
          onClick={isLoggedIn ? handleLogout : handleLogin} 
          disabled={isLoggingIn}
        >
          {isLoggedIn ? (
            <LogOut size={18} style={iconStyle} />
          ) : (
            <LogIn size={18} style={iconStyle} />
          )}
          {isLoggedIn ? "Log out" : (isLoggingIn ? "Logging in..." : "Login with Spotify")}
        </button>
      </div>
      {isAddingMarker && (
        <div style={overlayStyle}>
          <Music size={48} color="#ff5722" />
        </div>
      )}
    </div>
  );
}

export default Sidebar;