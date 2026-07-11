import * as jwtUtils from "../../commons/jwt";
import { getAuthManager } from "auth";
import { clearAuth } from "../slices/authSlice";
import { refreshTokenThunk } from "../actions/tokenAction";

const isExecuteMiddleware = (actionType) =>
  ["topics", "topic", "vocab"].some((value) => actionType.includes(value));

export const verifyTokenMiddleware = (store) => (next) => async (action) => {
  if (!isExecuteMiddleware(action.type)) {
    return next(action);
  }

  const tokenManager = getAuthManager().getTokenManager();
  const token = await tokenManager.getAccessToken();

  if (token && !jwtUtils.checkTokenExpired(token)) {
    return next(action);
  }

  const refreshTokenKey = await tokenManager.getRefreshTokenKey();
  if (!refreshTokenKey) {
    console.warn("No token found. Blocked action:", action);
    store.dispatch(clearAuth());
    return;
  }

  console.warn("Need to dispatch refresh token thunk. Blocked action:", action);
  store.dispatch(
    refreshTokenThunk({
      originalAction: action,
    }),
  );
  return;
};
