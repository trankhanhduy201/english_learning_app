import React, { Suspense } from 'react';
import { useLoaderData, Await, useParams, Outlet } from 'react-router-dom';
import { ErrorBoundary } from "react-error-boundary";
import TopicDetail from '../components/pages/topic/TopicDetail';
import ListVocab from '../components/pages/topic/ListVocab';
import LoadingOverlay from '../components/LoadingOverlay';
import { useSelector } from 'react-redux';

const Topic = () => {
  const lang = useSelector((state) => state.lang);
  const { topicId } = useParams();
  const { topicData, vocabsPromise } = useLoaderData();
  const isNew = () => topicId === 'new';

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-6 text-start mb-4">
          <h2>Topic info</h2>
          {topicData && topicData instanceof Promise ? (
            <Suspense fallback={
              <>
                <TopicDetail isNew={true} />
                <LoadingOverlay />
              </>
            }>
              <Await resolve={topicData}>
                {(topic) => (
                  <TopicDetail 
                    topic={topic}
                    topicId={topicId} 
                    isNew={isNew()} 
                  />
                )}
              </Await>
            </Suspense>
          ) : (
            <TopicDetail 
              topic={topicData}
              topicId={topicId} 
              isNew={isNew()} 
            />
          )}
        </div>
        {!isNew() && (
          <div className="col-lg-6 text-start">
            <h2>Vocabularies</h2>
            {vocabsPromise && vocabsPromise instanceof Promise ? (
              <>
                <ErrorBoundary fallback={<p className='alert alert-danger'>Can not get data</p>}>
                  <Suspense fallback={<p className='text-center'>Loading...</p>}>
                    <Await resolve={vocabsPromise}>
                      {(vocabDatas) => (
                        <>
                          <ListVocab 
                            vocabDatas={vocabDatas} 
                            topicId={topicId} 
                            lang={lang} 
                          />
                        </>
                      )}
                    </Await>
                  </Suspense>
                </ErrorBoundary>
              </>
            ) : (
              <ListVocab 
                vocabDatas={[]} 
                topicId={topicId} 
                lang={lang} 
              />
            )}
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
};

export default Topic;