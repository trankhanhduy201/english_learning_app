import { createSlice } from '@reduxjs/toolkit';
import { setErrorReducer, clearErrorReducer } from '../reducers/errorReducer';

const errorSlice = createSlice({
  name: 'error',
  initialState: [],
  reducers: {
    setError: setErrorReducer,
    clearError: clearErrorReducer
  },
});

export const { setError, clearError } = errorSlice.actions;
export default errorSlice.reducer;
