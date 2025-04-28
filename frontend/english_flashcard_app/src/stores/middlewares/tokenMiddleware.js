import * as cookieUtils from "../../utils/cookies";
import * as authCommon from "../../commons/authCommon";
import { clearAuth } from "../slices/authSlice";

const isExecuteMiddleware = (actionType) => 
  ['topics', 'topic', 'vocab'].some(value => actionType.includes(value));

export const verifyTokenMiddleware = (store) => (next) => async (action) => {
  console.log(action);
  if (isExecuteMiddleware(action.type)) {
    const { token, refreshToken } = cookieUtils.getAuthTokens();
    const isVerified = await authCommon.localVerifyToken(token, refreshToken);
    if (!isVerified) {
      store.dispatch(clearAuth());
      console.warn("No token found. Blocked action:", action);
      return;
    }
  }
  return next(action);
};
