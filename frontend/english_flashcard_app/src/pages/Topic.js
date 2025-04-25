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
  const isNew = () => isNaN(topicId);
  const loaderData = useLoaderData();

  return (
    <div className={`container ${!isNew() ? 'mt-4' : ''}`}>
      <div className="row">
        <div className={`${ isNew() ? 'col-12' : 'col-lg-6' } text-start mb-4`}>
          {!isNew() && (
            <h2>Topic info</h2>
          )}
          {loaderData?.topicData && loaderData.topicData instanceof Promise ? (
            <Suspense fallback={
              <>
                <TopicDetail isNew={true} />
                <LoadingOverlay />
              </>
            }>
              <Await resolve={loaderData.topicData}>
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
              topic={loaderData?.topicData}
              topicId={topicId} 
              isNew={isNew()} 
            />
          )}
        </div>
        {!isNew() && (
          <div className="col-lg-6 text-start">
            <h2>Vocabularies</h2>
            {loaderData?.vocabsPromise && loaderData.vocabsPromise instanceof Promise ? (
              <ErrorBoundary fallback={<p className='alert alert-danger'>Can not get data</p>}>
                <Suspense fallback={<p className='text-center'>Loading...</p>}>
                  <Await resolve={loaderData.vocabsPromise}>
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