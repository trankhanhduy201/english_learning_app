import { redirect } from "react-router-dom";
import store from "../../stores/store";
import qs from "qs";
import { createVocabThunk, deleteVocabThunk, importVocabThunk, updateVocabThunk } from "../../stores/thunks/vocabsThunk";

const getTrans = trans => {
  if (!trans) {
    return [];
  }
  return Object.keys(trans).reduce((n, v) => {
    return [...n, ...trans[v].map(v1 => v1)];
  }, []);
}

const createVocab = async (topicId, data) => {
  try {
    const result = await store.dispatch(createVocabThunk({ data })).unwrap();
    return redirect(`/topic/${topicId}`);
  } catch (err) {
    return err;
  }
}

const updateVocab = async (topicId, vocabId, data) => {
  try {
    await store.dispatch(updateVocabThunk({ vocabId, data })).unwrap();
    return redirect(`/topic/${topicId}`);
  } catch (err) {
    return err;
  }
}

const deleteVocab = async (topicId, vocabId, params = {}) => {
  try {
    await store.dispatch(deleteVocabThunk({ vocabId, params })).unwrap();
    return redirect(`/topic/${topicId}`);
  } catch (err) {
    return err;
  }
}

const doImportVocab = async (data) => {
  try {
    return await store.dispatch(importVocabThunk({ data })).unwrap();
  } catch (err) {
    return err;
  }
}

export const editVocab = async ({ request, params }) => {
  const formData = await request.formData();
  const updateData = qs.parse(Object.fromEntries(formData));
  
  if (params.vocabId === 'new') {
    return await createVocab(params.topicId, {
      ...updateData,
      translations: getTrans(updateData?.translations)
    });
  } 
  
  if (params.action === 'delete') {
    return await deleteVocab(params.topicId, params.vocabId, updateData);
  }
  
  return await updateVocab(
    params.topicId,
    params.vocabId, 
    { ...updateData, 
      id: params.vocabId, 
      translations: getTrans(updateData?.translations) 
    }
  );
}

export const importVocab = async ({ request, params }) => {
  const formData = await request.formData();
  const importData = qs.parse(Object.fromEntries(formData));
  return await doImportVocab({ ...importData, topic_id: params.topicId });
}