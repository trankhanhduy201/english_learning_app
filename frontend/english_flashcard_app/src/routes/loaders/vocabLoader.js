import store from "../../stores/store";
import { getVocabThunk } from "../../stores/thunks/vocabsThunk";

export const getVocab = async ({ request, params }) => {
  try {
    let vocabPromise = null;
    const { vocabId } = params;
    if (params.vocabId !== "new") {
      vocabPromise = store
        .dispatch(getVocabThunk({ vocabId }))
        .unwrap()
        .then(resp => resp.data);
    }
    return { vocabPromise };
  } catch (error) {
    throw new Response("", { status: 404 });
  }
};
