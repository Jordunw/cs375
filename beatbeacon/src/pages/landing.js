import React from 'react';

const BeatBeaconLandingPage = () => {
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 16px',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #1e3c72 100%)',
    fontFamily: 'Arial, sans-serif',
    position: "fixed",
    left: "0px",
    width: "100vw",
  };

  const containerStyle = {
    maxWidth: '400px',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  const headlineStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: '16px'
  };

  const textStyle = {
    fontSize: '1.125rem',
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: '32px'
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  };

  const buttonHoverStyle = {
    backgroundColor: '#b91c1c'
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={headlineStyle}>BeatBeacon</h1>
        <p style={textStyle}>
          Start Your Music Journey with BeatBeacon.
        </p>
        <button 
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = buttonStyle.backgroundColor;
          }}
          onClick={() => {  window.location = "/map"}}
        >
          Get Started
          <span style={{marginLeft: '8px'}}>→</span>
        </button>
      </div>
    </div>
  );
};

export default BeatBeaconLandingPage;