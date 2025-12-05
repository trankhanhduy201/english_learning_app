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

const TopicHeader = memo(({ current_member = null }) => {
  if (current_member?.is_blocking) {
    return <Navigate to="/topics" />
  }

  return (
    <>
      <div className="d-flex align-item-center">
        <h2>Topic info</h2>
        {(current_member && !current_member.is_owner) && (
          <button className={`btn btn-${current_member.is_subcribing ? 'danger' : 'primary'} ms-auto`}>
            {current_member.is_subcribing ? (
              <>
                <i className="bi bi-dash-circle text-white me-1"></i> 
                {current_member.is_accepted ? 'Unsubcribe' : 'Pending'}
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle text-white"></i> Subcribe
              </>
            )}
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
                              current_member={topic?.current_member}
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
