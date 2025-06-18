import { redirect } from "react-router-dom";
import store from "../../stores/store";
import { getTopicsThunk, getTopicThunk } from "../../stores/actions/topicAction";
import { getVocabsThunk } from "../../stores/actions/vocabAction";

export const getTopics = async () => {
  try {
    const topicDatas = store
      .dispatch(getTopicsThunk())
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
