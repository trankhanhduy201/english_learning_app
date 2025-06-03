import React, { Suspense, useCallback, useEffect } from "react";
import ListTopic from "../components/pages/topics/ListTopic";
import {
  Link,
  useLoaderData,
  Await,
  Outlet,
  useFetcher,
} from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import { setTopics, setIsFetched } from "../stores/slices/topicsSlice";
import { useDispatch } from "react-redux";
import DeleteAllButton from "../components/DeleteAllButton";

const Topics = () => {
  const deleteTopicFetcher = useFetcher();
  const { topicDatas } = useLoaderData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (topicDatas && topicDatas instanceof Promise) {
      topicDatas.then((data) => {
        dispatch(setTopics(data));
        dispatch(setIsFetched(true));
      });
    }
  }, [topicDatas, dispatch]);

  const removeTopic = useCallback(async (topicId) => {
    return await deleteTopicFetcher.submit(null, {
      action: `/topic/${topicId}/delete`,
      method: "delete",
    });
  });

  return (
    <>
      <h2 className="text-start">Topics</h2>
      <hr />
      <div className="d-flex justify-content-end mb-2">
        <Link className="btn btn-secondary me-2" to={"/topics/new"}>
          <i className="bi bi-plus-circle"></i> New topic
        </Link>
        <DeleteAllButton
          action={`/topics/delete`} 
          formName={'deleting_all_topic'}
        />
      </div>
      {topicDatas && topicDatas instanceof Promise ? (
        <Suspense fallback={<LoadingOverlay />}>
          <Await resolve={topicDatas}>
            {(topics) => (
              <ListTopic topics={topics} removeTopic={removeTopic} />
            )}
          </Await>
        </Suspense>
      ) : (
        <ListTopic topics={topicDatas} removeTopic={removeTopic} />
      )}
      <Outlet />
    </>
  );
};

export default Topics;
