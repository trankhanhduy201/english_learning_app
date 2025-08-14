import { createSlice } from "@reduxjs/toolkit";
import {
  setUserReducer,
  clearUserReducer,
} from "../reducers/userReducer";

const userSlice = createSlice({
  name: "user",
  initialState: {},
  reducers: {
    setUser: setUserReducer,
    clearUser: clearUserReducer,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
