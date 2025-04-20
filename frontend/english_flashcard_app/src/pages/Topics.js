import React, { Suspense, useEffect } from 'react';
import ListTopic from '../components/pages/topics/ListTopic';
import { Link, useLoaderData, Await, Outlet } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import { setTopics, setIsFetched } from '../stores/slices/topicsSlice';
import { useDispatch } from 'react-redux';

const Topics = () => {
  const { topicDatas } = useLoaderData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (topicDatas && topicDatas instanceof Promise) {
      topicDatas.then(data => {
        dispatch(setTopics(data));
        dispatch(setIsFetched(true));
      });
    }
  }, [topicDatas, dispatch]);

  return (
    <>
      <h1 className='text-start'>Topics</h1>
      <hr />
      <div className='d-flex justify-content-end mb-2'>
        <Link className='btn btn-secondary me-2' to={'/topics/new'}>
          <i className="bi bi-plus-circle"></i> New topic
        </Link>
        <Link className='btn btn-danger'>
          <i className="bi bi-trash text-white"></i> Delete all
        </Link>
      </div>
      {topicDatas && topicDatas instanceof Promise ? (
        <Suspense fallback={<LoadingOverlay />}>
          <Await resolve={topicDatas}>
            {(topics) => (
              <ListTopic topics={topics} />
            )}
          </Await>
        </Suspense>
      ) : (
        <ListTopic topics={topicDatas} />
      )}
      <Outlet />
    </>
  );
};

export default Topics;
