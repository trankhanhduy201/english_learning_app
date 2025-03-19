import * as vocabApi from "../../services/vocabApi";
import * as topicApi from "../../services/topicApi";

export const getVocab = async ({ request, params }) => {
  try {
    let vocab = null;
    const topics = topicApi.getTopics()
    if (params.vocabId !== 'new') {
      const vocabResp = await vocabApi.getVocab(params.vocabId);
      vocab = vocabResp.data;
    }
    return { vocab, topics };
  } catch (error) {
    throw new Response('', { status: 404 });
  }
}