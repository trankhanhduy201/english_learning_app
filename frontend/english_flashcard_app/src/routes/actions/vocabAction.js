import { redirect } from "react-router-dom";
import store from "../../stores/store";
import qs from "qs";
import {
  createVocabThunk,
  deleteAllVocabThunk,
  deleteVocabThunk,
  importVocabThunk,
  updateVocabThunk,
} from "../../stores/actions/vocabAction";
import { validateVocabDetail } from "../../validations/vocabValidation";

const getTrans = (topic) => {
  const trans = topic?.translations
  if (!trans) {
    return [{
      language: topic.language,
      translation: topic.word
    }];
  }
  return Object.keys(trans).reduce((newTrans, language) => {
    return [...newTrans, ...Object.values(trans[language]).map(v => v)];
  }, []);
};

const getValidatedVocabPayload = async (request) => {
  const formData = await request.formData();
  const rawData = qs.parse(Object.fromEntries(formData));

  if (rawData?._form_name === "deleting_vocab") {
    return rawData;
  }

  const { validatedData, errors } = await validateVocabDetail(rawData);
  if (errors) {
    return {
      status: "error",
      errors,
    };
  }

  return validatedData;
};

const createVocab = async (topicId, data) => {
  try {
    const result = await store.dispatch(createVocabThunk({ data })).unwrap();
    return redirect(`/topic/${topicId}`);
  } catch (err) {
    return err;
  }
};

const updateVocab = async (topicId, vocabId, data) => {
  try {
    await store.dispatch(updateVocabThunk({ vocabId, data })).unwrap();
    return redirect(`/topic/${topicId}`);
  } catch (err) {
    return err;
  }
};

const deleteVocab = async (topicId, vocabId, params = {}) => {
  try {
    const result = await store.dispatch(deleteVocabThunk({ vocabId, params })).unwrap();
    const vocabDetailPage = params?._form_name === "deleting_vocab";
    if (vocabDetailPage) {
      return redirect(`/topic/${topicId}`);
    }
    return result;
  } catch (err) {
    return err;
  }
};

const doDeleteAllVocabs = async (topicId) => {
  try {
    await store.dispatch(deleteAllVocabThunk({ topicId })).unwrap();
    return {
      status: "success",
    };
  } catch (err) {
    return err;
  }
};

const doImportVocab = async (data) => {
  try {
    return await store.dispatch(importVocabThunk({ data })).unwrap();
  } catch (err) {
    return err;
  }
};

export const editVocab = async ({ request, params }) => {
  const validatedData = await getValidatedVocabPayload(request);
  if (validatedData?.status === "error") {
    return validatedData;
  }

  if (params.vocabId === "new") {
    return await createVocab(params.topicId, {
      ...validatedData,
      topic: params.topicId,
      translations: getTrans(validatedData)
    });
  }

  if (params.action === "delete") { 
    return await deleteVocab(params.topicId, params.vocabId, validatedData);
  }
  
  return await updateVocab(params.topicId, params.vocabId, {
    ...validatedData,
    id: params.vocabId,
    translations: getTrans(validatedData)
  });
};

export const importVocabs = async ({ request, params }) => {
  const formData = await request.formData();
  const importData = qs.parse(Object.fromEntries(formData));
  return await doImportVocab({ ...importData, topic_id: params.topicId });
};

export const deleteVocabs = async ({ request, params }) => {
  return await doDeleteAllVocabs(params.topicId);
};
