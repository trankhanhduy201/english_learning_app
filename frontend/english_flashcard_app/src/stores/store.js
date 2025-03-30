import { configureStore } from '@reduxjs/toolkit';
import alertReducers from './slices/alertSlice';
import langReducers from './slices/langSlice';

const store = configureStore({
  reducer: {
    alerts: alertReducers,
    lang: langReducers,
  },
});

export default store;
