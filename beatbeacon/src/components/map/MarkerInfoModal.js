import React, { useState, useEffect } from 'react';
import { MapPin, Music, User, X } from 'lucide-react';

const MarkerInfoModal = ({ isOpen, onClose, onSubmit, location }) => {
  const [songName, setSongName] = useState('');
  const [username, setUsername] = useState('');
  const [formattedLocation, setFormattedLocation] = useState('Unknown');

  useEffect(() => {
    console.log("Location prop in MarkerInfoModal:", location);
    if (location) {
      if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
        setFormattedLocation(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
      } else if (typeof location === 'object') {
        // If location is an object but doesn't have lat and lng properties
        setFormattedLocation(JSON.stringify(location));
      } else {
        setFormattedLocation(String(location));
      }
    } else {
      setFormattedLocation('Unknown');
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ songName, username });
    setSongName('');
    setUsername('');
    onClose();
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    padding: '20px',
    width: '320px',
    maxWidth: '100%',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    color: '#FF5722',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#FF5722',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const inputContainerStyle = {
    marginBottom: '16px',
    position: 'relative',
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '8px 12px 8px 36px',
    border: '1px solid #FF5722',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '34px',
    color: '#FF5722',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#fff',
    border: '1px solid #FF5722',
    color: '#FF5722',
  };

  const submitButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#FF5722',
    border: 'none',
    color: '#fff',
  };

  const locationStyle = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            <MapPin size={20} />
            Add Marker Info
          </h3>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={20} />
          </button>
        </div>
        {location && (
          <div style={locationStyle}>
            <MapPin size={16} />
            Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={inputContainerStyle}>
            <label htmlFor="songName" style={labelStyle}>Song Name</label>
            <Music size={16} style={iconStyle} />
            <input
              type="text"
              id="songName"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              style={inputStyle}
              required
              placeholder="Enter song name"
            />
          </div>
          <div style={inputContainerStyle}>
            <label htmlFor="username" style={labelStyle}>Username</label>
            <User size={16} style={iconStyle} />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
              placeholder="Enter username"
            />
          </div>
          <div style={buttonContainerStyle}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              <X size={16} />
              Cancel
            </button>
            <button type="submit" style={submitButtonStyle}>
              <MapPin size={16} />
              Add Music
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkerInfoModal;