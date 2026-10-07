import { createThunkWithCallback, rejectWithErrorValue, dispatchSuccessAlert } from "./commonAction";
import { getToken as getTokenApi, registerUser as registerUserApi } from "../../services/authApi";
import { getAuthManager } from "auth";
import { revokeTokensThunk } from "./tokenAction";
import { setUser } from "../slices/userSlice";

export const loginThunk = createThunkWithCallback(
  "auth/login",
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    const response = await getTokenApi(username, password);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }

    const authManager = getAuthManager();
    const userInfo = await authManager.login(
      response.data?.access,
      response.data?.refresh_token_key,
    );

    if (!userInfo) {
      return rejectWithErrorValue(
        dispatch,
        rejectWithValue,
        response,
        "Invalid user info",
      );
    }

    dispatch(setUser(userInfo));
    dispatchSuccessAlert(dispatch, `Hi ${userInfo?.full_name}, wellcome back!`);
    return response;
  },
);

export const logoutThunk = createThunkWithCallback(
  "auth/logout",
  async ({ revokeTokenPermanent }, { dispatch, rejectWithValue }) => {
    const authManager = getAuthManager();
    const response = await dispatch(
      revokeTokensThunk({ permanent: revokeTokenPermanent })
    ).unwrap();

    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }

    await authManager.logout();
    return {
      status: 'success',
    };
  },
);

export const registerThunk = createThunkWithCallback(
  "auth/register",
  async ({ username, password, first_name, last_name }, { dispatch, rejectWithValue }) => {
    const response = await registerUserApi({
      username,
      password,
      first_name,
      last_name,
    });
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }

    dispatchSuccessAlert(dispatch, "Account created successfully");
    return response;
  },
);
