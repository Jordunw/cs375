import React from 'react';
import { Flame } from 'lucide-react';

const NavBar = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '60px',
      background: 'linear-gradient(to right, #8B0000, #B22222)',
      color: 'white',
      textAlign: 'center',
      fontSize: '24px',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Roboto', sans-serif",
    }}>
      <a href="/map" style={{
        position: 'absolute',
        top: '10px',
        left: '20px',
        height: '40px',
        color: '#FFA07A',
        textDecoration: 'none',
        padding: '0 15px',
        fontSize: '18px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.3s',
      }}>
        <Flame size={24} style={{ marginRight: '5px' }} />
        Map
      </a>
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#FFFFFF',
      }}>
        BeatBeacon
      </div>
      <a href="/feed" style={{
        position: 'absolute',
        top: '10px',
        right: '20px',
        height: '40px',
        color: '#FFA07A',
        textDecoration: 'none',
        padding: '0 15px',
        fontSize: '18px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.3s',
      }}>
        <Flame size={24} style={{ marginRight: '5px' }} />
        Feed
      </a>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap');
          a:hover {
            color: #FFD700;
          }
        `}
      </style>
    </div>
  );
};

export default NavBar;