import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import LoadingSpinner from './LoadingSpinner';

const ConfirmModal = ({ isShow, isSubmmiting, message, onClose, onSubmit }) => {
  return (
    <Modal show={isShow} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={onSubmit} 
          disabled={isSubmmiting}
        >
          {isSubmmiting && 
            <LoadingSpinner color={'light'} size={'sm'} />
          } Yes
        </Button>
        <Button 
          variant="secondary" 
          onClick={onClose} 
          disabled={isSubmmiting}
        >
          No
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
