import { useState, useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`toast toast--${toast.type}`} role="alert">
      <span className="toast__icon">
        {toast.type === 'success' ? '✓' : '✕'}
      </span>
      <span className="toast__message">{toast.message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
