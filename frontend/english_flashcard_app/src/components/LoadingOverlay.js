import React from 'react';

const LoadingOverlay = ({ position = 'fixed', background='dark' }) => {
  return (
    <div
      className={`position-${ position } top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-${ background } bg-opacity-75`}
      style={{ zIndex: 1050 }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
