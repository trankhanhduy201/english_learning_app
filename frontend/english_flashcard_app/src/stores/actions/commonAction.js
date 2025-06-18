import { createAsyncThunk } from "@reduxjs/toolkit";
import * as alertConfig from "../../configs/alertConfig";
import { setAlert } from "../slices/alertSlice";

export const dispatchSuccessAlert = (dispatch, message) => {
  dispatch(
    setAlert({
      type: alertConfig.SUCCESS_TYPE,
      message,
    }),
  );
};

export const rejectWithErrorValue = (
  dispatch,
  rejectWithValue,
  error,
  message = "",
) => {
  dispatch(
    setAlert({
      type: alertConfig.ERROR_TYPE,
      message: message || "There was something wrong",
    }),
  );
  return rejectWithValue(error);
};

export const createThunkWithCallback = (type, callback) =>
  createAsyncThunk(type, async (args, thunkAPI) => {
    try {
      return await callback(args, thunkAPI);
    } catch (err) {
      const { dispatch, rejectWithValue } = thunkAPI;
      return rejectWithErrorValue(dispatch, rejectWithValue, {
        status: "error",
      });
    }
  });
