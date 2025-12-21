import { memo, Suspense, useCallback } from "react";
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
import { TopicProvider, useTopicContext } from "../contexts/TopicContext";
import SubcribeButton from "../components/pages/topic/SubcribeButton";

const TopicHeader = memo(() => {
  const { topic, setTopic } = useTopicContext();
  const updateTopicMember = useCallback((newTopicMember) => {
    setTopic(prev => ({
      ...prev,
      current_member: {
        ...prev.current_member,
        ...newTopicMember
      }
    }));
  });

  if (topic?.current_member?.is_blocking) {
    return <Navigate to="/topics" />
  }

  return (
    <>
      <div className="d-flex align-item-center">
        <h2>Topic info</h2>
        {topic?.current_member && 
          <SubcribeButton
            topicId={topic.id}
            topicMember={topic.current_member} 
            updateTopicMember={updateTopicMember}
          />
        }
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
                            <TopicHeader />
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
