import { createAsyncThunk } from "@reduxjs/toolkit";
import * as alertConfigs from "../../configs/alertConfigs";
import { setAlert } from "../slices/alertSlice";

export const dispatchSuccessAlert = (dispatch, message) => {
  dispatch(setAlert({ 
    type: alertConfigs.SUCCESS_TYPE, 
    message 
  }));
};

export const rejectWithErrorValue = (dispatch, rejectWithValue, error, message = '') => {
  dispatch(setAlert({
    type: alertConfigs.ERROR_TYPE, 
    message: message || 'There was something wrong'
  }));
  return rejectWithValue(error);
}

export const createThunkWithCallback = 
  (type, callback) => createAsyncThunk(
    type,
    async (args, thunkAPI) => {
      try {
        return await callback(args, thunkAPI);
      } catch (err) {
        const { dispatch, rejectWithValue } = thunkAPI;
        return rejectWithErrorValue(dispatch, rejectWithValue, { status: "error" });
      }
    }
  );

