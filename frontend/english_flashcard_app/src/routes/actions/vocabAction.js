import { redirect } from "react-router-dom";
import store from "../../stores/store";
import * as vocabApi from "../../services/vocabApi";
import qs from "qs";
import { setAlert } from "../../stores/slices/alertSlice";
import * as alertConfigs from "../../configs/alertConfigs";

const getTrans = trans => {
  if (!trans) {
    return [];
  }
  return Object.keys(trans).reduce((n, v) => {
    return [...n, ...trans[v].map(v1 => v1)];
  }, []);
}

const getAlertData = (resp, vocabId) => {
  if (resp.status == 'error') {
    return {
      type: alertConfigs.ERROR_TYPE,
      message: `There was something wrong`
    }
  }
  return {
    type: alertConfigs.SUCCESS_TYPE,
    message: `Vocab is ${vocabId === 'new' ? 'created' : 'updated'} successfully`
  }
}

const doAction = async (params, updateVocab) => {
  if (params.vocabId === 'import') {
    return await vocabApi.importVocabs({
      ...updateVocab,
      topic_id: params.topicId
    });
  }

  if (params.vocabId === 'new') {
    return await vocabApi.createVocab({
      ...updateVocab,
      translations: getTrans(updateVocab?.translations)
    }, { throwEx: false });
  } 
  
  if (params.action === 'delete') {
    await vocabApi.deleteVocab(params.vocabId, { throwEx: false });
    return { 
      status: 'success',
      data: { id: params.vocabId }
    };
  }
  
  if (!isNaN(params.vocabId)) {
    return await vocabApi.updateVocab(
      params.vocabId, 
      { ...updateVocab, id: params.vocabId, translations: getTrans(updateVocab?.translations) }, 
      { throwEx: false }
    );
  }
}

export const editVocab = async ({ request, params }) => {
  const formData = await request.formData();
  const updateVocab = qs.parse(Object.fromEntries(formData));
  const resp = await doAction(params, updateVocab);
  if (resp.status === 'error') {
    return resp;
  }
  const alertData = getAlertData(resp, params.vocabId);
  store.dispatch(setAlert(alertData));
  return redirect(`/topic/${params.topicId}`);
}