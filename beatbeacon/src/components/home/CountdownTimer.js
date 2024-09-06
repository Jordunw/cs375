import React, { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      const minutesUntilNextHalfHour = 29 - (minutes % 30);
      const secondsLeft = 59 - seconds;
      
      return `${String(minutesUntilNextHalfHour).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const containerStyle = {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '24px',
    marginBottom: '20px',
    padding: '10px',
    background: 'linear-gradient(45deg, rgba(138, 43, 226, 0.2), rgba(255, 107, 107, 0.2))',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const labelStyle = {
    color: '#8a2be2',
    marginRight: '10px',
  };

  const timeStyle = {
    color: '#ff6b6b',
    fontSize: '28px',
  };

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>Next Battle In:</span>
      <span style={timeStyle}>{timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;