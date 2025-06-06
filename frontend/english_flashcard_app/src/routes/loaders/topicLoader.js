import { redirect } from "react-router-dom";
import * as topicApi from "../../services/topicApi";
import * as vocabApi from "../../services/vocabApi";
import * as topicCommon from "../../commons/topicCommon";

export const getTopics = async () => {
  try {
    let topicDatas = null;
    if (!topicCommon.isFetchedToStore()) {
      topicDatas = topicApi.getTopics().then((resp) => resp.data);
    } else {
      topicDatas = topicCommon.getTopicsFromStore();
    }
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
    const vocabsPromise = vocabApi
      .getVocabs(topicId)
      .then((resp) => resp.data);

    let topicData = topicCommon.getTopicFromStore(topicId);
    if (!topicData) {
      topicData = topicApi.getTopicById(topicId).then((resp) => resp.data);
    }
    return {
      topicData,
      vocabsPromise,
    };
  } catch (error) {
    throw new Response("", { status: 404 });
  }
};
