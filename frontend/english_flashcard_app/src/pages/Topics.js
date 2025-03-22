import React from 'react';
import { default as ListTopic } from '../components/Topics';
import { Link } from 'react-router-dom';

const Topics = () => {

  return (
    <>
        <h1 className='text-start'>Topics</h1>
        <hr />
        <div className='d-flex justify-content-end mb-2'>
          <Link className='btn btn-secondary me-2' to={'/topic/new'}>
            <i className="bi bi-plus-circle"></i> New topic
          </Link>
          <Link className='btn btn-danger'>
            <i className="bi bi-trash text-white"></i> Delete all
          </Link>
        </div>
        <ListTopic />
    </>
  );
};

export default Topics;
