import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuthManager } from "auth";
import {
  setUserReducer,
  clearUserReducer,
} from "../reducers/userReducer";

const userSlice = createSlice({
  name: "user",
  initialState: await getAuthManager().getUserManager().getUser() ?? {},
  reducers: {
    setUser: setUserReducer,
    clearUser: clearUserReducer,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
