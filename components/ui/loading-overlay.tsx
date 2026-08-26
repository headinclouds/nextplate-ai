'use client';

import classes from './loading-overlay.module.css';

export default function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className={classes.overlay} aria-live="polite">
      <span className={classes.loader}>{message}</span>
    </div>
  );
}
