import { createAsyncThunk } from "@reduxjs/toolkit";
import { setTopics, setTopic, clearTopic } from "../slices/topicsSlice";
import { setAlert } from "../slices/alertSlice";
import * as vocabApi from "../../services/vocabApi";
import * as topicApi from "../../services/topicApi";
import * as alertConfigs from "../../configs/alertConfigs";

const dispatchSuccessAlert = (dispatch, message) => {
	dispatch(setAlert({type: alertConfigs.SUCCESS_TYPE, message}));
}

export const getTopicsThunk = createAsyncThunk(
	'topics/get',
	async (_, { dispatch, rejectWithValue }) => {
		try {
			const response = await topicApi.getTopics();
			if (response.status === 'error') {
				return rejectWithValue(response);
			}
			dispatch(setTopics(response.data));
			return response.data;
		} catch (err) {
			return rejectWithValue({ status: 'error' });
		}
	}
);

export const getTopicThunk = createAsyncThunk(
	'topic/get',
	async ({ topicId, lang, cachedTopic=false }, { rejectWithValue }) => {
		try {
			let topicPromise = null;
			if (!cachedTopic) {
				topicPromise = topicApi
					.getTopicById(topicId)
					.then(resp => resp.data);
			}
			const vocabsPromise = vocabApi
				.getVocabs(topicId, lang)
				.then(resp => resp.data);

			return {
				topicPromise,
				vocabsPromise
			};
		} catch (err) {
			return rejectWithValue({ status: 'error' });
		}
	}
);

export const createTopicThunk = createAsyncThunk(
  'topic/create',
  async ({ data }, { dispatch, rejectWithValue }) => {
	try {
	  const response = await topicApi.createTopic(data, { throwEx: false });
	  if (response.status === 'error') {
				return rejectWithValue(response);
			}
			dispatch(setTopic(response.data));
			dispatchSuccessAlert(dispatch, "Topic is created successfully");
			return response;
	} catch (err) {
	  return rejectWithValue({ status: 'error' });
	}
  }
);

export const updateTopicThunk = createAsyncThunk(
  'topic/update',
  async ({ topicId, data }, { dispatch, rejectWithValue }) => {
	try {
	  const response = await topicApi.updateTopic(topicId, data, { throwEx: false });
	  if (response.status === 'error') {
				return rejectWithValue(response);
			}
			dispatch(setTopic(response.data));
			dispatchSuccessAlert(dispatch, "Topic is updated successfully");
			return response;
	} catch (err) {
	  return rejectWithValue({ status: 'error' });
	}
  }
);

export const deleteTopicThunk = createAsyncThunk(
  'topic/delete',
  async ({ topicId }, { dispatch, rejectWithValue }) => {
		const params = { id: topicId };
	try {
	  await topicApi.deleteTopic(topicId);
		dispatch(clearTopic(params));
		dispatchSuccessAlert(dispatch, "Topic is deleted successfully");
	  return { 
			status: 'success',
			data: params
		}
	} catch (err) {
	  return rejectWithValue({ 
			status: 'error',
			data: params
		});
	}
  }
);

export const deleteTopicsThunk = createAsyncThunk(
  'topics/delete',
  async (_, { dispatch, rejectWithValue, getState }) => {
		try {
			const state = getState();
			if (state.topics.data.length > 0) {
				await topicApi.deleteTopics();
				dispatch(setTopics([]));
			}
			dispatchSuccessAlert(dispatch, "Topics are deleted successfully");
			return { 
				status: 'success' 
			}
		} catch (err) {
			return rejectWithValue({ 
				status: 'error'
			});
		}
	}
);