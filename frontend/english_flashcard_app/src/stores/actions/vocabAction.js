
import * as vocabApi from "../../services/vocabApi";
import { 
  createThunkWithCallback, 
  dispatchSuccessAlert, 
  rejectWithErrorValue 
} from "./commonAction";

export const importVocabThunk = createThunkWithCallback(
  "vocab/import",
  async ({ data }, { dispatch, rejectWithValue }) => {
    const response = await vocabApi.importVocabs(data);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Vocabs are imported successfully");
    return response;
  },
);

export const getVocabsThunk = createThunkWithCallback(
  "vocabs/get",
  async ({ topicId }, { dispatch, rejectWithValue }) => {
    const response = await vocabApi.getVocabs(topicId);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);

export const getVocabThunk = createThunkWithCallback(
  "vocab/get",
  async ({ vocabId }, { dispatch, rejectWithValue }) => {
    const response = await vocabApi.getVocab(vocabId);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);

export const createVocabThunk = createThunkWithCallback(
  "vocab/create",
  async ({ data }, { dispatch, rejectWithValue }) => {
    const response = await vocabApi.createVocab(data);
    if (response.status === "error") {
      return rejectWithErrorValue(null, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Vocab is created successfully");
    return response;
  },
);

export const updateVocabThunk = createThunkWithCallback(
  "vocab/update",
  async ({ vocabId, data }, { dispatch, rejectWithValue }) => {
    const response = await vocabApi.updateVocab(vocabId, data);
    if (response.status === "error") {
      return rejectWithErrorValue(null, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Vocab is updated successfully");
    return response;
  },
);

export const deleteVocabThunk = createThunkWithCallback(
  "vocab/delete",
  async ({ vocabId, params }, { dispatch, rejectWithValue }) => {
    const vocabDetailPage = params?._form_name === "deleting_vocab";
    const respParams = { id: vocabId };
    const response = await vocabApi.deleteVocab(vocabId);
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
