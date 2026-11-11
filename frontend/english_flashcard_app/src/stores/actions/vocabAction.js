
import * as vocabApi from "../../services/vocabApi";
import { 
  createThunkWithCallback, 
  dispatchSuccessAlert, 
  rejectWithErrorValue 
} from "./commonAction";

export const importVocabThunk = createThunkWithCallback(
  "vocab/import",
  async ({ topicId, data }, { dispatch, rejectWithValue }) => {
    const response = await vocabApi.importVocabs(topicId, data);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Vocabs are imported successfully");
    return response;
  },
);

export const getVocabsThunk = createThunkWithCallback(
  "vocabs/get",
  async ({ topicId, inclTranslations = false }, { dispatch, rejectWithValue }) => {
    const query = inclTranslations ? { with: 'translations' } : {};
    const response = await vocabApi.getVocabs(topicId, { query });
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);

export const getVocabThunk = createThunkWithCallback(
  "vocab/get",
  async ({ topicId, vocabId, inclTranslations = false }, { dispatch, rejectWithValue }) => {
    const query = inclTranslations ? { with: 'translations' } : {};
    const response = await vocabApi.getVocab(topicId, vocabId, { query });
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);

export const createVocabThunk = createThunkWithCallback(
  "vocab/create",
  async ({ topicId, data }, { dispatch, rejectWithValue }) => {
    const response = await vocabApi.createVocab(topicId, data);
    if (response.status === "error") {
      return rejectWithErrorValue(null, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Vocab is created successfully");
    return response;
  },
);

export const updateVocabThunk = createThunkWithCallback(
  "vocab/update",
  async ({ topicId, vocabId, data }, { dispatch, rejectWithValue }) => {
    const response = await vocabApi.updateVocab(topicId, vocabId, data);
    if (response.status === "error") {
      return rejectWithErrorValue(null, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Vocab is updated successfully");
    return response;
  },
);

export const deleteVocabThunk = createThunkWithCallback(
  "vocab/delete",
  async ({ topicId, vocabId, params }, { dispatch, rejectWithValue }) => {
    const vocabDetailPage = params?._form_name === "deleting_vocab";
    const respParams = { id: vocabId };
    const response = await vocabApi.deleteVocab(topicId, vocabId);
    if (response?.status === "error") {
      return rejectWithErrorValue(
        !vocabDetailPage ? dispatch : null, rejectWithValue, response
      );
    }

    if (vocabDetailPage) {
      dispatchSuccessAlert(dispatch, "Vocab is deleted successfully");
    }

    return {
      status: "success",
      data: respParams,
    };
  },
);

export const deleteAllVocabThunk = createThunkWithCallback(
  "vocabs/delete",
  async ({ topicId }, { dispatch, rejectWithValue }) => {
    const respParams = { topic_id: topicId };
    const response = await vocabApi.deleteAllVocabs(topicId);
    if (response?.status === "error") {
      return rejectWithErrorValue(null, rejectWithValue, response);
    }

    dispatchSuccessAlert(dispatch, "All vocabs are deleted successfully");
    return {
      status: "success",
      data: respParams,
    };
  },
);
