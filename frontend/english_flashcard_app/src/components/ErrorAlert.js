import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearError } from '../stores/slices/errorSlice';
import AutoDismissAlert from './AutoDismissAlert';

const ErrorAlert = () => {
  const errors = useSelector((state) => state.errors);
  const dispatch = useDispatch();
  const onClose = (id) => dispatch(clearError(id));

  if (!errors) return null;

  return (
    <>
      {errors.map((error, index) => (
        <AutoDismissAlert
          key={index}
          id={index}
          message={error}
          type='danger'
          duration={1000}
          onClose={onClose}
        />
      ))}
    </>
  );
};

export default ErrorAlert;
