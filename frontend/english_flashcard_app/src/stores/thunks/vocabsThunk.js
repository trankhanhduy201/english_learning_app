import { createThunkWithCallback } from "./commonsThunk";
import * as vocabApi from "../../services/vocabApi";
import { dispatchSuccessAlert, rejectWithErrorValue } from "./commonsThunk";

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
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
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
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Vocab is updated successfully");
    return response;
  },
);

export const deleteVocabThunk = createThunkWithCallback(
  "vocab/delete",
  async ({ vocabId, params }, { dispatch }) => {
    const respParams = { id: vocabId };
    await vocabApi.deleteVocab(vocabId);
    if (params?._form_name == "deleting_vocab") {
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
  async ({ topicId, params }, { dispatch }) => {
    const respParams = { topic_id: topicId };
    await vocabApi.deleteAllVocabs(topicId);
    dispatchSuccessAlert(dispatch, "All vocabs are deleted successfully");
    return {
      status: "success",
      data: respParams,
    };
  },
);

