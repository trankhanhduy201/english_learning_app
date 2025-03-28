import React, { Suspense } from 'react';
import ListTopic from '../components/pages/topics/ListTopic';
import { Link, useLoaderData, Await } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';

const Topics = () => {
  const { topicsPromise } = useLoaderData();

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
      <Suspense fallback={<LoadingOverlay />}>
        <Await resolve={topicsPromise}>
          <ListTopic />
        </Await>
      </Suspense>
    </>
  );
};

export default Topics;
