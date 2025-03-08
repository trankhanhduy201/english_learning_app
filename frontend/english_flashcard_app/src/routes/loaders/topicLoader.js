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
    const url = new URL(request.url);
    const topicResp = await topicApi.getTopicById(params.topicId);
    const vocabResp = vocabApi.getVocabs(
      params.topicId,
      url.searchParams.get('lang') || langConfigs.DEFAULT_LANG
    );
    return {
      topic: topicResp.data,
      vocabs: vocabResp
    };
  } catch (error) {
    throw new Response('', { status: 404 });
  }
}