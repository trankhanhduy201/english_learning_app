import * as vocabApi from "../../services/vocabApi";
import qs from "qs";

const getTrans = (trans) => {
  if (!trans) {
    return [];
  }
  return Object.keys(trans).reduce((n, v) => {
    return [...n, ...trans[v].map(v1 => v1)];
  }, []);
}

export const editVocab = async ({ request, params }) => {
  const formData = await request.formData();
  const updateVocab = qs.parse(Object.fromEntries(formData));
	return await vocabApi.updateVocab(
    params.vocabId, 
    { ...updateVocab, id: params.vocabId, translations: getTrans(updateVocab?.translations) }, 
    { throwEx: false }
  );
}