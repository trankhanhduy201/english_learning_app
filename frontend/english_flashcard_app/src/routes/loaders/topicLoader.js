import * as langConfigs from "../../configs/langConfigs";
import * as topicApi from "../../services/topicApi";
import * as vocabApi from "../../services/vocabApi";

export const getTopics = async () => {
  try {
    return { topicsPromise: topicApi.getTopics().then(resp => resp.data) };
  } catch (error) {
    throw new Response('', { status: 500 });
  }
}

export const getTopic = async ({ request, params }) => {
  try {
    let topicPromise = null;
    let vocabsPromise = null;
    if (params.topicId !== 'new') {
      const url = new URL(request.url);
      const lang = url.searchParams.get('lang') || langConfigs.DEFAULT_LANG;
      topicPromise = topicApi.getTopicById(params.topicId).then(resp => resp.data);
      vocabsPromise = vocabApi.getVocabs(params.topicId, lang).then(resp => resp.data);
    }
    return {
      topicPromise,
      vocabsPromise
    };
  } catch (error) {
    throw new Response('', { status: 404 });
  }
}