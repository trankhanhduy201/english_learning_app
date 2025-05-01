import React, { Suspense, useCallback, useEffect } from 'react';
import ListTopic from '../components/pages/topics/ListTopic';
import { Link, useLoaderData, Await, Outlet, useFetcher } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import { setTopics, setIsFetched } from '../stores/slices/topicsSlice';
import { useDispatch } from 'react-redux';
import useConfirmModal from '../hooks/useConfirmModal';
import ConfirmModal from '../components/ConfirmModal';

const Topics = () => {
  const deleteAllFetcher = useFetcher();
  const deleteTopicFetcher = useFetcher();
  const { topicDatas } = useLoaderData();
  const dispatch = useDispatch();
  const confirmDeleteModal = useConfirmModal({
    submitActionCallback: async () => {
      const formData = new FormData();
      formData.append('_not_revalidate', '1');
      return await deleteAllFetcher.submit(formData, {
        action: `/topics/delete`, 
        method: 'delete'
      });
    }
  });

  useEffect(() => {
    if (topicDatas && topicDatas instanceof Promise) {
      topicDatas.then(data => {
        dispatch(setTopics(data));
        dispatch(setIsFetched(true));
      });
    }
  }, [topicDatas, dispatch]);

  const removeTopic = useCallback(async (topicId) => {
    return await deleteTopicFetcher.submit(null, {
      action: `/topic/${topicId}/delete`,
      method: 'delete'
    });
  });

  return (
    <>
      <h2 className='text-start'>Topics</h2>
      <hr />
      <div className='d-flex justify-content-end mb-2'>
        <Link className='btn btn-secondary me-2' to={'/topics/new'}>
          <i className="bi bi-plus-circle"></i> New topic
        </Link>
        <Link className='btn btn-danger' onClick={() => confirmDeleteModal.showConfirmModal()}>
          <i className="bi bi-trash text-white"></i> Delete all
        </Link>
      </div>
      {topicDatas && topicDatas instanceof Promise ? (
        <Suspense fallback={<LoadingOverlay />}>
          <Await resolve={topicDatas}>
            {(topics) => (
              <ListTopic 
                topics={topics} 
                removeTopic={removeTopic}
              />
            )}
          </Await>
        </Suspense>
      ) : (
        <ListTopic
          topics={topicDatas} 
          removeTopic={removeTopic}
        />
      )}
      {confirmDeleteModal.isShowModal && (
        <ConfirmModal
          message="Are you sure you want to delete all topics?"
          isShow={confirmDeleteModal.isShowModal}
          isSubmmiting={confirmDeleteModal.isSubmmiting}
          onClose={confirmDeleteModal.onClickNo}
          onSubmit={confirmDeleteModal.onClickYes}
        />
      )}
      <Outlet />
    </>
  );
};

export default Topics;