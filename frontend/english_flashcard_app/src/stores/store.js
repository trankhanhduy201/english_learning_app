import { configureStore } from '@reduxjs/toolkit';
import alertReducers from './slices/alertSlice';

const store = configureStore({
  reducer: {
    alerts: alertReducers,
  },
});

export default store;
