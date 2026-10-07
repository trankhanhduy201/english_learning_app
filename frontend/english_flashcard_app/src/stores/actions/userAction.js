import {
  createThunkWithCallback,
  rejectWithErrorValue,
  dispatchSuccessAlert,
} from "./commonAction";
import { setUser } from "../slices/userSlice";
import * as userApi from "../../services/userApi";
import { getAuthManager } from "auth";

export const getProfileThunk = createThunkWithCallback(
  "user/profile/get",
  async (_, { dispatch, rejectWithValue }) => {
    const response = await userApi.getProfile();
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    
    const user = response?.data ?? {};
    dispatch(setUser(user));

    const authManager = getAuthManager();
    await authManager.getUserManager().setUser(user);
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

    const updatedUser = response.data ?? {};
    dispatch(setUser(updatedUser));

    const authManager = getAuthManager();
    await authManager.getUserManager().setUser(updatedUser);

    dispatchSuccessAlert(dispatch, "Profile updated successfully");
    return response;
  },
);
