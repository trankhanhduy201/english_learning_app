import * as authApi from "../services/authApi";
import * as jwtUtils from "./jwt";
import * as cookieUtils from "../commons/cookies";

export const refreshNewToken = async () => {
  const resp = await authApi.refreshToken();
  if (resp.status === "error") {
    cookieUtils.clearAccessToken();
    return false;
  }

  const accessToken = resp.data.access;
  cookieUtils.setAccessToken(accessToken);
  return accessToken;
};

export const verifyToken = async (token) => {
  if (token) {
    const resp = await authApi.verifyToken(token);
    if (resp.code == 200) {
      return true;
    }
  }

  const accessToken = await refreshNewToken();
  return !!accessToken;
};

export const localVerifyToken = async (token) => {
  if (token && !jwtUtils.checkTokenExpired(token, 120)) {
    return true;
  }

  const accessToken = await refreshNewToken();
  return !!accessToken;
};

export const getUserInfo = (token) => {
  if (!token) {
    return null;
  }

  const payload = jwtUtils.getTokenPayload(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.user_id,
    username: payload.username,
    email: payload.email,
    full_name: payload.full_name,
  };
};
