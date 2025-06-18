import * as topicApi from "../../services/topicApi";
import {
  setTopics,
  setTopic,
  clearTopic,
  setIsFetched,
} from "../slices/topicSlice";
import { 
  createThunkWithCallback, 
  dispatchSuccessAlert, 
  rejectWithErrorValue 
} from "./commonAction";

export const getTopicsThunk = createThunkWithCallback(
  "topics/get",
  async (_, { dispatch, rejectWithValue, getState }) => {
    const state = getState();
    if (state.topics.isFetched) {
      return {
        status: "success",
        data: state.topics.data,
      };
    }
    const response = await topicApi.getTopics();
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    if (response.data) {
      dispatch(setTopics(response.data));
      dispatch(setIsFetched(true));
    }
    return response;
  },
);

export const getTopicThunk = createThunkWithCallback(
  "topic/get",
  async ({ topicId }, { dispatch, rejectWithValue, getState }) => {
    const state = getState();
    const topicFilters = state?.topics.data.find(
      (topic) => parseInt(topic.id) === parseInt(topicId),
    );
    if (topicFilters) {
      return {
        status: "success",
        data: topicFilters,
      };
    }
    const response = await topicApi.getTopicById(topicId);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);

export const createTopicThunk = createThunkWithCallback(
  "topic/create",
  async ({ data }, { dispatch, rejectWithValue }) => {
    const response = await topicApi.createTopic(data);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatch(setTopic(response.data));
    dispatchSuccessAlert(dispatch, "Topic is created successfully");
    return response;
  },
);

export const updateTopicThunk = createThunkWithCallback(
  "topic/update",
  async ({ topicId, data }, { dispatch, rejectWithValue }) => {
    const response = await topicApi.updateTopic(topicId, data);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatch(setTopic(response.data));
    dispatchSuccessAlert(dispatch, "Topic is updated successfully");
    return response;
  },
);

export const deleteTopicThunk = createThunkWithCallback(
  "topic/delete",
  async ({ topicId }, { dispatch }) => {
    const params = { id: topicId };
    await topicApi.deleteTopic(topicId);
    dispatch(clearTopic(params));
    dispatchSuccessAlert(dispatch, "Topic is deleted successfully");
    return {
      status: "success",
      data: params,
    };
  },
);

export const deleteTopicsThunk = createThunkWithCallback(
  "topics/delete",
  async (_, { dispatch, getState }) => {
    const state = getState();
    if (state.topics.data.length > 0) {
      await topicApi.deleteTopics();
      dispatch(setTopics([]));
    }
    dispatchSuccessAlert(dispatch, "Topics are deleted successfully");
    return {
      status: "success",
    };
  },
);
