import {
  createThunkWithCallback,
  rejectWithErrorValue,
  dispatchSuccessAlert,
} from "./commonAction";
import { setUser } from "../slices/userSlice";
import * as userApi from "../../services/userApi";

export const getInfo = createThunkWithCallback(
  "user/info",
  async (_, { dispatch, rejectWithValue }) => {
    const response = await userApi.getProfile();
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    const user = response?.data?.user ?? response?.data ?? {};
    dispatch(setUser(user));
    return response;
  },
);

export const getProfileThunk = createThunkWithCallback(
  "user/profile/get",
  async (_, { dispatch, rejectWithValue }) => {
    const response = await userApi.getProfile();
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);

export const updateProfileThunk = createThunkWithCallback(
  "user/profile/update",
  async ({ data }, { dispatch, rejectWithValue }) => {
    const response = await userApi.updateProfile(data);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatchSuccessAlert(dispatch, "Profile updated successfully");
    return response;
  },
);
