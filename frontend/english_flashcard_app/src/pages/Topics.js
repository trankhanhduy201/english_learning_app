import { Suspense, useCallback } from "react";
import ListTopic from "../components/pages/topics/ListTopic";
import {
  Link,
  useLoaderData,
  Await,
  Outlet,
  useFetcher,
} from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import DeleteAllButton from "../components/DeleteAllButton";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";

const Topics = () => {
  const deleteTopicFetcher = useFetcher();
  const { topicDatas } = useLoaderData();
  const navigate = useNavigate();

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
          formName={"deleting_all_topic"}
        />
      </div>
      <Suspense fallback={<LoadingOverlay />}>
        <Await resolve={topicDatas}>
          {(topics) => 
            <>
              <ListTopic 
                topics={topics.results} 
                removeTopic={removeTopic} 
              />
              <Pagination 
                current_page={topics.paginations.current_page}
                total_pages={topics.paginations.total_pages}
                total_items={topics.paginations.total_items}
                onPageChange={(page) => {
                  navigate(`/topics?page=${page}`);
                }}
              />
            </>
          }
        </Await>
      </Suspense>
      <Outlet />
    </>
  );
};

export default Topics;
