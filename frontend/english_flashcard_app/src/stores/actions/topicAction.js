import * as topicApi from "../../services/topicApi";
import { 
  createThunkWithCallback, 
  dispatchSuccessAlert, 
  rejectWithErrorValue 
} from "./commonAction";

export const getTopicsThunk = createThunkWithCallback(
  "topics/get",
  async ({ filters }, { dispatch, rejectWithValue }) => {
    const response = await topicApi.getTopics(filters);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);

export const getTopicThunk = createThunkWithCallback(
  "topic/get",
  async ({ topicId }, { dispatch, rejectWithValue }) => {
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
    dispatchSuccessAlert(dispatch, "Topic is updated successfully");
    return response;
  },
);

export const deleteTopicThunk = createThunkWithCallback(
  "topic/delete",
  async ({ topicId }, { dispatch }) => {
    const params = { id: topicId };
    await topicApi.deleteTopic(topicId);
    dispatchSuccessAlert(dispatch, "Topic is deleted successfully");
    return {
      status: "success",
      data: params,
    };
  },
);

export const deleteTopicsThunk = createThunkWithCallback(
  "topics/delete",
  async (_, { dispatch }) => {
    await topicApi.deleteTopics();
    dispatchSuccessAlert(dispatch, "Topics are deleted successfully");
    return {
      status: "success",
    };
  },
);
