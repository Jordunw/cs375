import React, { useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

function MapOverlay({ isAddingMarker, onCancel }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (!isAddingMarker) return null;

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-out',
  };

  const messageStyle = {
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
    textAlign: 'center',
    padding: '15px 25px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '50px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    animation: 'pulse 2s infinite',
  };

  const cancelButtonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    marginBottom: '20px',
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  return (
    <div style={overlayStyle}>
      <div style={messageStyle}>
        <MapPin size={24} />
        Click Anywhere On Map to Add a Marker
      </div>
      <button 
        style={cancelButtonStyle} 
        onClick={onCancel}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#ff6b6b'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4757'}
      >
        <X size={18} />
        Cancel
      </button>
    </div>
  );
}

export default MapOverlay;