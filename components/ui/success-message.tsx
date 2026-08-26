'use client';

import { useEffect, useState } from 'react';
import classes from './success-message.module.css';

export default function SuccessMessage({ message }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`${classes.successMessage} ${!isVisible ? classes.fadeOut : ''}`} role="alert">
      <div className={classes.content}>
        <span className={classes.icon}>✓</span>
        <p>{message}</p>
        <button 
          className={classes.closeButton} 
          onClick={() => setIsVisible(false)}
          aria-label="Close message"
        >
          ×
        </button>
      </div>
    </div>
  );
}
