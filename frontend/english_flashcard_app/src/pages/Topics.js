import React, { Suspense, useEffect } from 'react';
import ListTopic from '../components/pages/topics/ListTopic';
import { Link, useLoaderData, Await, Outlet, useFetcher } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import { setTopics, setIsFetched } from '../stores/slices/topicsSlice';
import { useDispatch } from 'react-redux';
import useConfirmModal from '../hooks/useConfirmModal';
import ConfirmModal from '../components/ConfirmModal';

const Topics = () => {
  const deleteFetcher = useFetcher();
  const { topicDatas } = useLoaderData();
  const dispatch = useDispatch();
  const submitActionCallback = () => {
    const formData = new FormData();
    formData.append('_not_revalidate', '1');
    deleteFetcher.submit(formData, {
      action: `/topics/delete`, 
      method: 'delete'
    });
  }
  const { 
    isShowModal, 
    showConfirmModal,
    hideConfirmModal,
    onClickNo, 
    onClickYes
  } = useConfirmModal({ submitActionCallback });

  useEffect(() => {
    if (topicDatas && topicDatas instanceof Promise) {
      topicDatas.then(data => {
        dispatch(setTopics(data));
        dispatch(setIsFetched(true));
      });
    }
  }, [topicDatas, dispatch]);

  useEffect(() => {
    if (deleteFetcher.data?.status === 'success') {
      hideConfirmModal();
    }
  }, [deleteFetcher]);

  return (
    <>
      <h1 className='text-start'>Topics</h1>
      <hr />
      <div className='d-flex justify-content-end mb-2'>
        <Link className='btn btn-secondary me-2' to={'/topics/new'}>
          <i className="bi bi-plus-circle"></i> New topic
        </Link>
        <Link className='btn btn-danger' onClick={() => showConfirmModal()}>
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
      {isShowModal && (
        <ConfirmModal
          isShow={isShowModal}
          isSubmmiting={deleteFetcher.state === 'submitting'}
          message="Are you sure you want to delete all topics?"
          onClose={onClickNo}
          onSubmit={onClickYes}
        />
      )}
      <Outlet />
    </>
  );
};

export default Topics;
