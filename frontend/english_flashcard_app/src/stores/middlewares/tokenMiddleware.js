import * as cookies from "../../commons/cookies";
import * as jwtUtils from "../../commons/jwt";
import { clearAuth } from "../slices/authSlice";
import { refreshTokenThunk } from "../actions/tokenAction";

const isExecuteMiddleware = (actionType) =>
  ["topics", "topic", "vocab"].some((value) => actionType.includes(value));

export const verifyTokenMiddleware = (store) => (next) => (action) => {
  if (!isExecuteMiddleware(action.type)) {
    return next(action);
  }

  const { token, refreshToken } = cookies.getAuthTokens();
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
