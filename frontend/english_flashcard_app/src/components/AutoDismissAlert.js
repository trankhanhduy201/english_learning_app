import React, { useEffect, useState } from "react";

const AutoDismissAlert = ({
  idx,
  message,
  type = "success",
  duration = 2000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const handleCloseAlert = (idx) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(idx);
    }, 200);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleCloseAlert(idx);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      className={`alert alert-${type} alert-dismissible text-start mb-2 fade-element ${isVisible ? "visible" : "hidden"}`}
      role="alert"
      style={{ zIndex: 999 }}
    >
      {message}
      <button
        type="button"
        className="btn-close float-end"
        aria-label="Close"
        onClick={() => handleCloseAlert(idx)}
      ></button>
    </div>
  );
};

export default AutoDismissAlert;
