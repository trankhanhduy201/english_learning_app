import * as cookieUtils from "../../utils/cookies";
import * as jwtUtils from "../../utils/jwt";
import { clearAuth } from "../slices/authSlice";
import { refreshTokenThunk } from "../thunks/tokenThunk";

const isExecuteMiddleware = (actionType) =>
  ["topics", "topic", "vocab"].some((value) => actionType.includes(value));

export const verifyTokenMiddleware = (store) => (next) => (action) => {
  if (!isExecuteMiddleware(action.type)) {
    return next(action);
  }

  const { token, refreshToken } = cookieUtils.getAuthTokens();
  if (token && !jwtUtils.checkTokenExpired(token)) {
    return next(action);
  }

  if (!refreshToken || jwtUtils.checkTokenExpired(refreshToken)) {
    console.warn("No token found. Blocked action:", action);
    store.dispatch(clearAuth());
    return;
  }

  console.warn("Need to dispatch refresh token thunk. Blocked action:", action);
  store.dispatch(
    refreshTokenThunk({
      refreshToken,
      originalAction: action,
    }),
  );
  return;
};
