import { createSlice } from '@reduxjs/toolkit';
import { setAuthReducer, clearAuthReducer } from '../reducers/authReducer';

export const initialState = {
  userInfo: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setAuth: setAuthReducer,
    clearAuth: clearAuthReducer
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;