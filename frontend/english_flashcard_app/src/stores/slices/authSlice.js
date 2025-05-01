import { createSlice } from "@reduxjs/toolkit";
import {
  setAuthReducer,
  clearAuthReducer,
  setUserInfoReducer,
} from "../reducers/authReducer";

export const initialState = {
  userInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setAuth: setAuthReducer,
    clearAuth: clearAuthReducer,
    setUserInfo: setUserInfoReducer,
  },
});

export const { setAuth, clearAuth, setUserInfo } = authSlice.actions;
export default authSlice.reducer;
