import { redirect } from "react-router-dom";
import * as langConfigs from "../../configs/langConfigs";
import * as topicApi from "../../services/topicApi";
import * as vocabApi from "../../services/vocabApi";
import store from "../../stores/store";

const getLang = (request) => {
  const url = new URL(request.url);
  return url.searchParams.get('lang') || langConfigs.DEFAULT_LANG;
}

const getIsFetched = () => {
  const state = store.getState();
  return state?.topics?.isFetched ?? false;
}

const getTopicsFromStore = () => {
  const state = store.getState();
  return state?.topics?.data ?? [];
}

const getTopicFromStore = (topicId) => {
  return getTopicsFromStore().find(topic => parseInt(topic.id) === parseInt(topicId)) ?? null;
}

export const getTopics = async () => {
  try {
    let topicDatas = null;
    if (!getIsFetched()) {
      topicDatas = topicApi.getTopics().then(resp => resp.data);
    } else {
      topicDatas = getTopicsFromStore();
    }
    return { topicDatas };
  } catch (error) {
    throw new Response('', { status: 400 });
  }
}

export const getTopic = async ({ request, params }) => {
  const { topicId } = params;
  if (isNaN(topicId)) {
    return redirect('/topics');
  }

  try {
    const vocabsPromise = vocabApi
      .getVocabs(topicId, getLang(request))
      .then(resp => resp.data);

    let topicData = getTopicFromStore(topicId);
    if (!topicData) {
      topicData = topicApi
        .getTopicById(topicId)
        .then(resp => resp.data);
    }
    return {
      topicData,
      vocabsPromise
    };
  } catch (error) {
    throw new Response('', { status: 404 });
  }
}