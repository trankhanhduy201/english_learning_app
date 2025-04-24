import React, { useEffect, useState } from 'react';

const CountdownLogoutModal = ({ seconds = 5, onFinish }) => {
  const [countdown, setCountdown] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content text-start">
            <div className="modal-header">
              <h5 className="modal-title w-100">Notice</h5>
            </div>
            <div className="modal-body">
              <p>
                You will be logged out automatically in{' '}
                <strong>{countdown}</strong> seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default CountdownLogoutModal;
