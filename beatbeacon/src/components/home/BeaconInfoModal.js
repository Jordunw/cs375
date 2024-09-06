import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

const BeaconInfoModal = ({ isOpen, onClose, beacon, onVote, getVoteCount, getUserVote }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [leftSwordRotation, setLeftSwordRotation] = useState(-45);
  const [rightSwordRotation, setRightSwordRotation] = useState(-135);
  const [isFighting, setIsFighting] = useState(false);

  const getRandomRotation = useCallback((base, range) => {
    return base + (Math.random() * range - range / 2);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAnimationKey(prev => prev + 1);
      const interval = setInterval(() => {
        setLeftSwordRotation(getRandomRotation(15, 150));
        setRightSwordRotation(getRandomRotation(75, 150));
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isOpen, getRandomRotation]);

  const handleVote = (songId) => {
    onVote(beacon.id, songId);
  };

  const handleFight = () => {
    setIsFighting(true);
    setTimeout(() => setIsFighting(false), 3000);
  };

  if (!isOpen || !beacon) return null;

  const getButtonStyle = (songId) => {
    const baseStyle = {
      padding: '5px 10px',
      margin: '5px 0',
      border: 'none',
      borderRadius: '15px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
    };

    const userVote = getUserVote(beacon.id);
    
    if (userVote === songId) {
      return {
        ...baseStyle,
        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
        color: 'white',
      };
    } else {
      return {
        ...baseStyle,
        background: 'linear-gradient(45deg, #ff6b6b, #8a2be2)',
        color: 'white',
      };
    }
  };

  const getButtonText = (songId) => {
    const userVote = getUserVote(beacon.id);
    return userVote === songId ? 'Voted' : 'Vote';
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  };

  const modalStyle = {
    backgroundColor: '#0f0f1f',
    color: '#f8f8f8',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 0 50px rgba(138, 43, 226, 0.3)',
    width: '90%',
    maxWidth: '700px',
    position: 'relative',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '32px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #ff6b6b, #8a2be2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const battlefieldStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    position: 'relative',
    height: '200px',
  };

  const songContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '40%',
  };

  const voteStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #ff6b6b, #8a2be2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '-15px',
    marginTop: '-15px',
  };

  const songNameStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '5px',
  };

  const swordContainerStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '200px',
  };

  const remainingSongsStyle = {
    listStyle: 'none',
    padding: 0,
    margin: '0 auto',
    width: '80%',
  };

  const songItemStyle = {
    padding: '15px',
    margin: '10px 0',
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: '10px',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 10px rgba(138, 43, 226, 0.1)',
  };

  const rankStyle = {
    fontWeight: 'bold',
    marginRight: '10px',
    color: '#ff6b6b',
  };

  const remainingVoteStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#8a2be2',
    marginLeft: '10px',
  };

  const addedByStyle = {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
  };

  const fightStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: '20px',
    cursor: 'pointer',
  };

  const buttonStyle = {
    padding: '12px 25px',
    margin: '20px auto 0',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    background: 'linear-gradient(45deg, #ff6b6b, #8a2be2)',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'block',
    transition: 'all 0.3s ease',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={overlayStyle}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={modalStyle}
          >
            <h2 style={titleStyle}>{beacon.songName}</h2>
            
            <CountdownTimer />
            
            <div style={battlefieldStyle}>
              {beacon.topSongs.slice(0, 2).map((song, index) => (
                <div key={song.id || index} style={songContainerStyle}>
                  <div style={voteStyle}>{getVoteCount(beacon.id, song.id)}</div>
                  <p>votes</p>
                  <div style={songNameStyle}>{song.name || song.music_name}</div>
                  <div style={addedByStyle}>Added by: {song.addedBy || song.added_by_username}</div>
                  <button 
                    style={getButtonStyle(song.id)}
                    onClick={() => handleVote(song.id)}
                  >
                    {getButtonText(song.id)}
                  </button>
                </div>
              ))}
              <div style={swordContainerStyle}>
                <motion.div
                  animate={{ rotate: leftSwordRotation, x: [-10, 0] }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ 
                    position: 'absolute', 
                    left: '40%', 
                    top: '50%', 
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Sword size={100} color="#ff6b6b" />
                </motion.div>
                <motion.div
                  animate={{ rotate: rightSwordRotation, x: [10, 0] }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ 
                    position: 'absolute', 
                    left: '5%', 
                    top: '50%', 
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Sword size={100} color="#8a2be2" />
                </motion.div>
              </div>
            </div>
            
            <div 
              style={fightStyle}
              onClick={handleFight}
            >
              FIGHT!
            </div>
            
            <ol style={remainingSongsStyle}>
              {beacon.topSongs.slice(2, 5).map((song, index) => (
                <motion.li
                  key={song.id || index}
                  style={{...songItemStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div style={{flex: 1}}>
                    <span style={rankStyle}>#{index + 3}</span>
                    {song.name || song.music_name}
                    <div style={addedByStyle}>Added by: {song.addedBy || song.added_by_username}</div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={remainingVoteStyle}>
                      Votes: {getVoteCount(beacon.id, song.id)}
                    </div>
                    <button 
                      style={{...getButtonStyle(song.id), marginLeft: '10px'}}
                      onClick={() => handleVote(song.id)}
                    >
                      {getButtonText(song.id)}
                    </button>
                  </div>
                </motion.li>
              ))}
            </ol>
            
            <button
              onClick={onClose}
              style={buttonStyle}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BeaconInfoModal;