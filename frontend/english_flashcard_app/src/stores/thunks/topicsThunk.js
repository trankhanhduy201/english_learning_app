import { createAsyncThunk } from "@reduxjs/toolkit";
import * as topicApi from "../../services/topicApi";
import { setTopics, setTopic, clearTopic } from "../slices/topicsSlice";

export const getTopicsThunk = createAsyncThunk(
	'topics/getTopics',
	async (_, { dispatch, rejectWithValue }) => {
		try {
			const response = await topicApi.getTopics();
			if (response.status === 'error') {
				return rejectWithValue(response);
			}
			dispatch(setTopics(response.data));
			return response;
		} catch (err) {
			return rejectWithValue({ status: 'error' });
		}
	}
);

export const createTopicThunk = createAsyncThunk(
  'topics/create',
  async ({ data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await topicApi.createTopic(data, { throwEx: false });
      if (response.status === 'error') {
				return rejectWithValue(response);
			}
			dispatch(setTopic(response.data));
			return response;
    } catch (err) {
      return rejectWithValue({ status: 'error' });
    }
  }
);

export const updateTopicThunk = createAsyncThunk(
  'topics/update',
  async ({ topicId, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await topicApi.updateTopic(topicId, data, { throwEx: false });
      if (response.status === 'error') {
				return rejectWithValue(response);
			}
			dispatch(setTopic(response.data));
			return response;
    } catch (err) {
      return rejectWithValue({ status: 'error' });
    }
  }
);

export const deleteTopicThunk = createAsyncThunk(
  'topics/delete',
  async ({ topicId, data }, { dispatch, rejectWithValue }) => {
		const params = { id: topicId };
    try {
      await topicApi.updateTopic(topicId, data, { throwEx: false });
			dispatch(clearTopic(params));
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
