import { createThunkWithCallback } from "./commonsThunk";
import { setAuth } from "../slices/authSlice";
import { setAlert } from "../slices/alertSlice";
import * as authApi from "../../services/authApi";
import * as alertConfigs from "../../configs/alertConfigs";
import { rejectWithErrorValue } from "./commonsThunk";

export const loginThunk = createThunkWithCallback(
  "auth/login",
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    const response = await authApi.getToken(username, password);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatch(setAuth({ userInfo: { username } }));
    dispatch(
      setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: `Hi ${username}, wellcome back!`,
      }),
    );
    return response;
  },
);
