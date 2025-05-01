import { createAsyncThunk } from "@reduxjs/toolkit";
import { setAuth } from "../slices/authSlice";
import { setAlert } from "../slices/alertSlice";
import * as authApi from "../../services/authApi";
import * as alertConfigs from "../../configs/alertConfigs";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.getToken(username, password);
      if (response.status === "error") {
        return rejectWithValue(response);
      }
      dispatch(setAuth({ userInfo: { username } }));
      dispatch(
        setAlert({
          type: alertConfigs.SUCCESS_TYPE,
          message: `Hi ${username}, wellcome back!`,
        }),
      );
      return response;
    } catch (err) {
      return rejectWithValue({ status: "error" });
    }
  },
);
