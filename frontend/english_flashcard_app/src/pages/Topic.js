import React, { Suspense } from 'react';
import { useLoaderData, Await, useParams } from 'react-router-dom';
import { ErrorBoundary } from "react-error-boundary";
import TopicDetail from '../components/pages/topic/TopicDetail';
import ListVocab from '../components/pages/topic/ListVocab';
import LoadingOverlay from '../components/LoadingOverlay';
import { useSelector } from 'react-redux';

const Topic = () => {
  const lang = useSelector((state) => state.lang);
  const { topicId } = useParams();
  const { topicPromise, vocabsPromise } = useLoaderData();
  const isNew = () => topicId === 'new';

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-6 text-start mb-4">
          <h2>Topic info</h2>
          <Suspense fallback={
            <>
              <TopicDetail isNew={true} />
              <LoadingOverlay />
            </>
          }>
            <Await resolve={topicPromise}>
              <TopicDetail topicId={topicId} isNew={isNew()} />
            </Await>
          </Suspense>
        </div>
        {!isNew() && (
          <div className="col-lg-6 text-start">
            <h2>Vocabularies</h2>
            <ErrorBoundary fallback={<p className='alert alert-danger'>Can not get data</p>}>
              <Suspense fallback={<p className='text-center'>Loading...</p>}>
                <Await resolve={vocabsPromise}>
                  <ListVocab lang={lang} topicId={topicId} />
                </Await>
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topic;