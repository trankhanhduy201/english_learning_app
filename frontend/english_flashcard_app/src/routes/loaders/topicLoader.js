import * as langConfigs from "../../configs/langConfigs";
import * as topicApi from "../../services/topicApi";
import * as vocabApi from "../../services/vocabApi";

export const getTopics = async () => {
  try {
    const resp = await topicApi.getTopics();
    return { topics: resp.data };
  } catch (error) {
    throw new Response('', { status: 500 });
  }
}

export const getTopic = async ({ request, params }) => {
  try {
    let topicResp = null;
    let vocabResp = null;
    if (params.topicId !== 'new') {
      const url = new URL(request.url);
      topicResp = await topicApi.getTopicById(params.topicId);
      vocabResp = vocabApi.getVocabs(
        params.topicId,
        url.searchParams.get('lang') || langConfigs.DEFAULT_LANG
      );
    }
    return {
      topic: topicResp ? topicResp.data : topicResp,
      vocabs: vocabResp
    };
  } catch (error) {
    throw new Response('', { status: 404 });
  }
}