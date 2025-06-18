import { createSlice } from "@reduxjs/toolkit";
import {
  setIsFetchedReducer,
  setTopicsReducer,
  clearTopicsReducer,
  setTopicReducer,
  clearTopicReducer,
} from "../reducers/topicReducer";

const initialState = {
  data: [],
  isFetched: false,
};

const topicSlice = createSlice({
  name: "topics",
  initialState: initialState,
  reducers: {
    setIsFetched: setIsFetchedReducer,
    setTopics: setTopicsReducer,
    clearTopics: clearTopicsReducer,
    setTopic: setTopicReducer,
    clearTopic: clearTopicReducer,
  },
});

export const { 
  setIsFetched, 
  setTopics, 
  clearTopics, 
  setTopic, 
  clearTopic 
} = topicSlice.actions;

export default topicSlice.reducer;
