import { redirect } from "react-router-dom";
import store from "../../stores/store";
import * as langConfigs from "../../configs/langConfigs";
import * as topicCommon from "../../commons/topicCommon" ;
import { getTopicsThunk, getTopicThunk } from "../../stores/thunks/topicsThunk";

const getLang = (request) => {
  const url = new URL(request.url);
  return url.searchParams.get('lang') || langConfigs.DEFAULT_LANG;
}

export const getTopics = async () => {
  try {
    let topicDatas = null;
    if (!topicCommon.isFetchedToStore()) {
      topicDatas = await store.dispatch(getTopicsThunk()).unwrap();
    } else {
      topicDatas = topicCommon.getTopicsFromStore();
    }
    return { topicDatas };
  } catch (err) {
    throw new Response('', { status: 400 });
  }
}

export const getTopic = async ({ request, params }) => {
  const { topicId } = params;
  if (isNaN(topicId)) {
    return redirect('/topics');
  }

  try {
    const lang = getLang(request);
    let topicData = topicCommon.getTopicFromStore(topicId);
    return await store.dispatch(
      getTopicThunk({ topicId, lang, cachedTopic: !!topicData })
    ).unwrap();
  } catch (error) {
    throw new Response('', { status: 404 });
  }
}