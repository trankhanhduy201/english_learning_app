import { createThunkWithCallback, rejectWithErrorValue } from "./commonAction";
import { refreshNewToken } from "../../commons/token";
import { revokeTokens } from "../../services/authApi";

export const refreshTokenThunk = createThunkWithCallback(
  "token/refresh",
  async ({ refreshToken, originalAction }, { dispatch }) => {
    const accessToken = await refreshNewToken(refreshToken);
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
  async (_, { dispatch, rejectWithValue }) => {
    const response = await revokeTokens();
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);
