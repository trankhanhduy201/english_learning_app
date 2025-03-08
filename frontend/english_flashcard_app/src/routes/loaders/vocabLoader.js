import * as vocabApi from "../../services/vocabApi";
import * as topicApi from "../../services/topicApi";

export const getVocab = async ({ request, params }) => {
  try {
    const vocabResp = await vocabApi.getVocab(params.vocabId);
    const topicsResp = topicApi.getTopics();
    return { 
      vocab: vocabResp.data,
      topics: topicsResp
    };
  } catch (error) {
    throw new Response('', { status: 404 });
  }
}