import React, { useEffect, useState } from 'react';

const AutoDismissAlert = ({ id, message, type = 'success', duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const handleCloseAlert = id => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 200);
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCloseAlert(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className={`alert alert-${type} alert-dismissible text-start mb-4 fade-element ${isVisible ? 'visible' : 'hidden'}`} role="alert">
      {message}
      <button
        type="button"
        className="btn-close float-end"
        aria-label="Close"
        onClick={() => handleCloseAlert(id)}
      ></button>
    </div>
  );
};

export default AutoDismissAlert;
