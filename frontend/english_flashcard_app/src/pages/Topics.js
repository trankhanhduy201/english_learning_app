import { Suspense, useCallback, useEffect } from "react";
import ListTopic from "../components/pages/topics/ListTopic";
import {
  useLoaderData,
  Await,
  Outlet,
  useFetcher,
} from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TopicFormSearch from "../components/pages/topics/FormSearch";
import TopicHeader from "../components/pages/topics/Header";

const Topics = () => {
  const deleteTopicFetcher = useFetcher();
  const [ searchParams ] = useSearchParams();
  const { topicDatas } = useLoaderData();
  const navigate = useNavigate();

  const getPageLink = useCallback((page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    return `/topics?${params.toString()}`;
  }, [searchParams]);

  const removeTopic = useCallback(async (topicId) => {
    const params = new FormData();
    params.append("_not_revalidate", '1');
    return await deleteTopicFetcher.submit(params, {
      action: `/topic/${topicId}/delete`,
      method: "delete",
    });
  }, [deleteTopicFetcher]);

  useEffect(() => {
    if (deleteTopicFetcher.state === 'idle' && deleteTopicFetcher.data?.status === 'success') {
      const tableTr = document.querySelectorAll('table#topics__list-item tbody tr');
      const page = parseInt(searchParams.get('page')) || 1;
      let newPage = 1;
      if (tableTr.length > 1) {
        newPage = page;
      } else if (page > 1) {
        newPage = page - 1;
      }
      navigate(getPageLink(newPage));
    }
  }, [deleteTopicFetcher.state, deleteTopicFetcher.data]);

  return (
    <>
      <TopicHeader />
      <TopicFormSearch />
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
                  onPageChange={(page) => navigate(getPageLink(page))}
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
