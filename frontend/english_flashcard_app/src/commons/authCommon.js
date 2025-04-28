import * as authApi from "../services/authApi";
import * as jwtUtils from "../utils/jwt";
import * as cookieUtils from "../utils/cookies";

export const refreshNewToken = async (refresh) => {
  let newTokenData = {};
  if (!refresh) {
    return newTokenData;
  }
  
  const resp = await authApi.refreshToken(refresh, { throwEx: false });
  if (resp.code == 200) {
    newTokenData = resp.data;
  }

  return newTokenData;
}

export const verifyToken = async (token, refreshToken) => {
  if (token) {
    const resp = await authApi.verifyToken(token, { throwEx: false });
    if (resp.code == 200) {
      return true;
    }
  }

  if (refreshToken) {
    const { access } = await refreshNewToken(refreshToken, { throwEx: false });
    if (access) {
      cookieUtils.setAccessToken(access);
      return true;
    }
  }

  cookieUtils.clearAuthTokens();
  return false;
}

export const localVerifyToken = async (token, refreshToken) => {
  if (token && !jwtUtils.checkTokenExpired(token)) {
    return true;
  }

  if (!refreshToken || jwtUtils.checkTokenExpired(refreshToken)) {
    return false;
  }

  const { access } = await refreshNewToken(refreshToken, { throwEx: false });
  if (access) {
    console.log(access);
    cookieUtils.setAccessToken(access);
    return true;
  }

  cookieUtils.clearAuthTokens();
  return false;
}