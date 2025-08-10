import { Suspense, useCallback, useEffect } from "react";
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
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Topics = () => {
  const deleteTopicFetcher = useFetcher();
  const [ searchParams ] = useSearchParams();
  const { topicDatas } = useLoaderData();
  const navigate = useNavigate();

  const removeTopic = useCallback(async (topicId) => {
    const params = new FormData();
    params.append("_not_revalidate", '1');
    return await deleteTopicFetcher.submit(params, {
      action: `/topic/${topicId}/delete`,
      method: "delete",
    });
  });

  useEffect(() => {
    if (deleteTopicFetcher.state === 'idle' && deleteTopicFetcher.data?.status === 'success') {
      const tableTr = document.querySelectorAll('table#ListTopicsTable tbody tr');
      const page = parseInt(searchParams.get('page')) || 1;
      if (tableTr.length > 1) {
        navigate(`/topics?page=${page}`);
        return;
      }
      if (page > 1) {
        navigate(`/topics?page=${page - 1}`);
        return;
      }
      navigate('/topics');
    }
  }, [deleteTopicFetcher.state, deleteTopicFetcher.data]);

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
              {topics.results.length > 0 && (
                <Pagination 
                  current_page={topics.paginations.current_page}
                  total_pages={topics.paginations.total_pages}
                  total_items={topics.paginations.total_items}
                  onPageChange={(page) => {
                    navigate(`/topics?page=${page}`);
                  }}
                />
              )}
            </>
          }
        </Await>
      </Suspense>
      <Outlet />
    </>
  );
};

export default Topics;
