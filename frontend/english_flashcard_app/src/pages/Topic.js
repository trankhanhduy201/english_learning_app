import { Suspense } from "react";
import { useLoaderData, Await, useParams, Outlet, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import TopicDetail from "../components/pages/topic/TopicDetail";
import ListVocab from "../components/pages/topic/ListVocab";
import LoadingOverlay from "../components/LoadingOverlay";
import { TopicProvider } from "../contexts/TopicContext";

const Topic = () => {
  const { topicId } = useParams();
  const isNew = () => isNaN(topicId);
  const loaderData = useLoaderData();

  return (
    <TopicProvider initialTopic={null}>
      <div className="row">
        <div className={`${isNew() ? "col-12" : "col-lg-12"} text-start mb-4`}>
          {!isNew() && (
            <>
              <h2>Topic info</h2>
              <hr />
            </>
          )}
          <ErrorBoundary
            fallback={<Navigate to="/topics" />}
          >
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
                  <>
                    {topic ? (
                      <TopicDetail 
                        topic={topic} 
                        topicId={topicId} 
                        isNew={isNew()} 
                      />
                    ) : (
                      <Navigate to="/topics" />
                    )}
                  </>
                )}
              </Await>
            </Suspense>
          </ErrorBoundary>
        </div>
        {!isNew() && (
          <div className="col-lg-12 text-start">
            <h2>Vocabularies</h2>
            <hr />
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
            <Outlet />
          </div>
        )}
      </div>
    </TopicProvider>
  );
};

export default Topic;
