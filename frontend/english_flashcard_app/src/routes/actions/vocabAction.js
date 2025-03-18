import * as vocabApi from "../../services/vocabApi";
import qs from "qs";

export const editVocab = async ({ request, params }) => {
  const formData = await request.formData();
  const updateVocab = qs.parse(Object.fromEntries(formData));
	return await vocabApi.updateVocab(params.vocabId, { ...updateVocab, id:params.vocabId }, { throwEx: false });
}