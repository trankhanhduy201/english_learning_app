import { Suspense, useState } from "react";
import { useLoaderData, Await, useParams, Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import TopicDetail from "../components/pages/topic/TopicDetail";
import ListVocab from "../components/pages/topic/ListVocab";
import LoadingOverlay from "../components/LoadingOverlay";
import { TopicProvider } from "../contexts/TopicContext";

const Topic = () => {
  const { topicId } = useParams();
  const isNew = () => isNaN(topicId);
  const loaderData = useLoaderData();

  // Get initial topic data for context
  const initialTopic = loaderData?.topicData instanceof Promise
    ? null
    : loaderData?.topicData;

  return (
    <TopicProvider initialTopic={initialTopic}>
      <div className="row">
        <div className={`${isNew() ? "col-12" : "col-lg-12"} text-start mb-4`}>
          {!isNew() && (
            <>
              <h2>Topic info</h2>
              <hr />
            </>
          )}
          {loaderData?.topicData && loaderData.topicData instanceof Promise ? (
            <Suspense
              fallback={
                <>
                  <TopicDetail isNew={true} />
                  <LoadingOverlay />
                </>
              }
            >
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
          <div className="col-lg-12 text-start">
            <h2>Vocabularies</h2>
            <hr />
            {loaderData?.vocabsPromise &&
            loaderData.vocabsPromise instanceof Promise ? (
              <ErrorBoundary
                fallback={<p className="alert alert-danger">Can not get data</p>}
              >
                <Suspense fallback={<p className="text-center">Loading...</p>}>
                  <Await resolve={loaderData.vocabsPromise}>
                    {(vocabDatas) => (
                      <>
                        <ListVocab
                          vocabDatas={vocabDatas}
                          topicId={topicId}
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
              />
            )}
            <Outlet />
          </div>
        )}
      </div>
    </TopicProvider>
  );
};

export default Topic;
