import { createAsyncThunk } from "@reduxjs/toolkit";
import * as vocabApi from "../../services/vocabApi";
import { setAlert } from "../slices/alertSlice";
import * as alertConfigs from "../../configs/alertConfigs";

const dispatchSuccessAlert = (dispatch, message) => {
  dispatch(setAlert({ type: alertConfigs.SUCCESS_TYPE, message }));
};

export const importVocabThunk = createAsyncThunk(
  "vocab/import",
  async ({ data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await vocabApi.importVocabs(data, { throwEx: false });
      if (response.status === "error") {
        return rejectWithValue(response);
      }
      dispatchSuccessAlert(dispatch, "Vocabs are imported successfully");
      return response;
    } catch (err) {
      return rejectWithValue({ status: "error" });
    }
  },
);

export const createVocabThunk = createAsyncThunk(
  "vocab/create",
  async ({ data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await vocabApi.createVocab(data, { throwEx: false });
      if (response.status === "error") {
        return rejectWithValue(response);
      }
      dispatchSuccessAlert(dispatch, "Vocab is created successfully");
      return response;
    } catch (err) {
      return rejectWithValue({ status: "error" });
    }
  },
);

export const updateVocabThunk = createAsyncThunk(
  "vocab/update",
  async ({ vocabId, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await vocabApi.updateVocab(vocabId, data, {
        throwEx: false,
      });
      if (response.status === "error") {
        return rejectWithValue(response);
      }
      dispatchSuccessAlert(dispatch, "Vocab is updated successfully");
      return response;
    } catch (err) {
      return rejectWithValue({ status: "error" });
    }
  },
);

export const deleteVocabThunk = createAsyncThunk(
  "vocab/delete",
  async ({ vocabId, params }, { dispatch, rejectWithValue }) => {
    const respParams = { id: vocabId };
    try {
      await vocabApi.deleteVocab(vocabId);
      if (params?._form_name == "deleting_vocab") {
        dispatchSuccessAlert(dispatch, "Vocab is deleted successfully");
      }
      return {
        status: "success",
        data: respParams,
      };
    } catch (err) {
      return rejectWithValue({
        status: "error",
        data: respParams,
      });
    }
  },
);

export const deleteAllVocabThunk = createAsyncThunk(
  "vocabs/delete",
  async ({ topicId, params }, { dispatch, rejectWithValue }) => {
    const respParams = { topic_id: topicId };
    try {
      await vocabApi.deleteAllVocabs(topicId);
      dispatchSuccessAlert(dispatch, "All vocabs are deleted successfully");
      return {
        status: "success",
        data: respParams,
      };
    } catch (err) {
      return rejectWithValue({
        status: "error",
        data: respParams,
      });
    }
  },
);

