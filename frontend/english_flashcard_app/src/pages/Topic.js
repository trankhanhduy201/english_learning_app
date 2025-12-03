import { memo, Suspense, useEffect } from "react";
import {
  useLoaderData,
  Await,
  useParams,
  Outlet,
  Navigate,
} from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import TopicDetail from "../components/pages/topic/TopicDetail";
import ListVocab from "../components/pages/topic/ListVocab";
import LoadingOverlay from "../components/LoadingOverlay";
import { TopicProvider } from "../contexts/TopicContext";
import { isTopicOwner } from "../commons/topic";

const TopicHeader = memo(({ topic=null }) => {
  return (
    <>
      <div className="d-flex align-item-center">
        <h2>Topic info</h2>
        {!isTopicOwner(topic?.created_by) && (
          <button className="btn btn-primary ms-auto">
            <i className="bi bi-plus-circle text-white"></i> Subscribe
          </button>
        )}
      </div>
      <hr />
    </>
  )
});

const Topic = memo(() => {
  const { topicId } = useParams();
  const isNew = () => isNaN(topicId);
  const loaderData = useLoaderData();

  return (
    <TopicProvider initialTopic={null}>
      <div className="row">
        <div className={`${isNew() ? "col-12" : "col-lg-12"} text-start mb-4`}>
          {!isNew() ? (
            <>
              <ErrorBoundary fallback={<Navigate to="/topics" />}>
                <Suspense
                  fallback={
                    <>
                      <TopicHeader />
                      <TopicDetail isNew={true} />
                      <LoadingOverlay />
                    </>
                  }
                >
                  <Await resolve={loaderData.topicData}>
                    {(topic) => (
                      <>
                        {topic ? (
                          <>
                            <TopicHeader
                              topic={topic}
                            />
                            <TopicDetail
                              topic={topic}
                              topicId={topicId}
                              isNew={isNew()}
                            />
                          </>
                        ) : (
                          <Navigate to="/topics" />
                        )}
                      </>
                    )}
                  </Await>
                </Suspense>
              </ErrorBoundary>
            </>
          ) : (
            <>
              <TopicHeader />
              <TopicDetail isNew={true} />
            </>
          )}
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
                      <ListVocab vocabDatas={vocabDatas} topicId={topicId} />
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
});

export default Topic;
