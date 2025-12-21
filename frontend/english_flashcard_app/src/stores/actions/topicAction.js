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

export const updateTopicMembersThunk = createThunkWithCallback(
  "topic/members/update",
  async ({ topicId, data }, { dispatch, rejectWithValue }) => {
    const response = await topicApi.updateTopicMembers(topicId, data);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Topic members are updated successfully");
    return response;
  },
);

export const memberInteractTopicThunk = createThunkWithCallback(
  "topic/member/interact",
  async ({ topicId, action }, { dispatch }) => {
    const params = { id: topicId };
    switch (action) {
      case "subcribe":
        await topicApi.subcribeTopic(topicId);
        dispatchSuccessAlert(dispatch, "Subcribed topic successfully");
        break;
      case "unsubcribe":
        await topicApi.unsubcribeTopic(topicId);
        dispatchSuccessAlert(dispatch, "Unsubcribed topic successfully");
        break;
      default:
        throw new Error("Invalid action for interactTopicThunk");
    }
    return {
      status: "success",
      data: params,
    };
  },
);
