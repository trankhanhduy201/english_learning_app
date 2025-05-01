import { createSlice } from "@reduxjs/toolkit";
import { setAlertReducer, clearAlertReducer } from "../reducers/alertReducer";

const alertSlice = createSlice({
  name: "alerts",
  initialState: [],
  reducers: {
    setAlert: setAlertReducer,
    clearAlert: clearAlertReducer,
  },
});

export const { setAlert, clearAlert } = alertSlice.actions;
export default alertSlice.reducer;
