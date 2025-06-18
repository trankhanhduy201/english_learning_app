import { createThunkWithCallback } from "./commonAction";
import * as tokenCommon from "../../commons/token";

export const refreshTokenThunk = createThunkWithCallback(
  "token/refresh",
  async ({ refreshToken, originalAction }, { dispatch }) => {
    const accessToken = await tokenCommon.refreshNewToken(refreshToken);
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
