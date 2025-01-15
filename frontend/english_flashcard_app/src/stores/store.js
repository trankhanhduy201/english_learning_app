import { configureStore } from '@reduxjs/toolkit';
import errorReducers from './slices/errorSlice';

const store = configureStore({
  reducer: {
    errors: errorReducers,
  },
});

export default store;
