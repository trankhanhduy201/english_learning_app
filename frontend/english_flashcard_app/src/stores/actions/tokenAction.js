import { createThunkWithCallback, rejectWithErrorValue } from "./commonAction";
import { getAuthManager } from "auth";
import { revokeTokens } from "../../services/authApi";

export const refreshTokenThunk = createThunkWithCallback(
  "token/refresh",
  async ({ originalAction }, { dispatch }) => {
    const tokenManager = getAuthManager().getTokenManager();
    const accessToken = await tokenManager.refreshNewToken();
    if (accessToken === false) {
      throw new Error("Can not refresh new access token");
    }
    dispatch(originalAction);
    return {
      status: "success",
      data: { accessToken },
    };
  },
);

export const revokeTokensThunk = createThunkWithCallback(
  "tokens/revoke",
  async ({ permanent }, { dispatch, rejectWithValue }) => {
    const response = await revokeTokens({ permanent });
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);
