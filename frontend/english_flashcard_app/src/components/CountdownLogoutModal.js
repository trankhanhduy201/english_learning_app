import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

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
    <Modal show={true} centered>
      <Modal.Header>
        <Modal.Title>Notice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          You will be logged out automatically in{' '}
          <strong>{countdown}</strong> seconds.
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default CountdownLogoutModal;
