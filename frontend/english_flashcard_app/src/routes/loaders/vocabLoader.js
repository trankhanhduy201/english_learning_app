import * as vocabApi from "../../services/vocabApi";
import * as topicApi from "../../services/topicApi";

export const getVocab = async ({ request, params }) => {
  try {
    let vocabPromise = null;
    if (params.vocabId !== "new") {
      vocabPromise = vocabApi
        .getVocab(params.vocabId)
        .then((data) => data.data);
    }
    return { vocabPromise };
  } catch (error) {
    throw new Response("", { status: 404 });
  }
};
