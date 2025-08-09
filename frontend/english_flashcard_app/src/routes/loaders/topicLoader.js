import { redirect } from "react-router-dom";
import store from "../../stores/store";
import { getTopicsThunk, getTopicThunk } from "../../stores/actions/topicAction";
import { getVocabsThunk } from "../../stores/actions/vocabAction";

export const getFilters = ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  return {
    'page': searchParams.get('page') || 1,
    'text_search': searchParams.get('text_search') || '',
    'learning_language': searchParams.get('learning_language') || '',
  }
}

export const getTopics = async ({ request }) => {
  try {
    const topicDatas = store
      .dispatch(getTopicsThunk({
        filters: getFilters({ request }),
      }))
      .unwrap()
      .then((resp) => resp.data);
    return { topicDatas };
  } catch (error) {
    throw new Response("", { status: 400 });
  }
};

export const getTopic = async ({ request, params }) => {
  const { topicId } = params;
  if (isNaN(topicId)) {
    return redirect("/topics");
  }

  try {
    const vocabsPromise = store
      .dispatch(getVocabsThunk({ topicId }))
      .unwrap()
      .then((resp) => resp.data);

    const topicData = store
      .dispatch(getTopicThunk({ topicId }))
      .unwrap()
      .then((resp) => resp.data);

    return {
      topicData,
      vocabsPromise,
    };
  } catch (error) {
    throw new Response("", { status: 404 });
  }
};
