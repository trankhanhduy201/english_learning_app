import { configureStore } from '@reduxjs/toolkit';
import alertReducers from './slices/alertSlice';
import langReducers from './slices/langSlice';
import topicsReducers from './slices/topicsSlice';

const store = configureStore({
  reducer: {
    alerts: alertReducers,
    lang: langReducers,
    topics: topicsReducers
  },
});

export default store;
