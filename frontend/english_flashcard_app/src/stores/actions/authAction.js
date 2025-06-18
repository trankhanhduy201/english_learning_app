import { createThunkWithCallback, rejectWithErrorValue } from "./commonAction";
import { setAuth } from "../slices/authSlice";
import { setAlert } from "../slices/alertSlice";
import * as authApi from "../../services/authApi";
import * as alertConfig from "../../configs/alertConfig";

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
        type: alertConfig.SUCCESS_TYPE,
        message: `Hi ${username}, wellcome back!`,
      }),
    );
    return response;
  },
);
