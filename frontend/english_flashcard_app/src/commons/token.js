import * as authApi from "../services/authApi";
import * as jwtUtils from "./jwt";
import { TOKEN_VERIFY_EXPIRE } from "../configs/appConfig";
import { clearValue, getValue, setValue } from "./localStorage";

const VERIFY_CACHE_KEY = "token_verify_cache";
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token_key";

export const setRefreshTokenKey = (key) => {
  setValue(REFRESH_TOKEN_KEY, key);
};

export const getRefreshTokenKey = () => {
  return getValue(REFRESH_TOKEN_KEY, null);
};

export const clearRefreshTokenKey = () => {
  clearValue(REFRESH_TOKEN_KEY);
};

export const setAccessToken = (newToken) => {
  setValue(TOKEN_KEY, newToken);
};

export const getAccessToken = () => {
  return getValue(TOKEN_KEY, null);
};

export const clearAccessToken = () => {
  clearValue(TOKEN_KEY);
};

export const readVerifyCache = (token) => {
  const parsed = getValue(VERIFY_CACHE_KEY, null);
  if (!parsed) return null;
  if (
    parsed &&
    parsed.at &&
    parsed?.token === token &&
    Date.now() - parsed.at < TOKEN_VERIFY_EXPIRE
  ) {
    return parsed.verified;
  }
  return null;
};

export const setVerifyCache = (token, verified) => {
  setValue(VERIFY_CACHE_KEY, JSON.stringify({ at: Date.now(), verified, token }));
};

export const clearVerifyCache = () => {
  clearValue(VERIFY_CACHE_KEY);
};

export const refreshNewToken = async () => {
  const refreshTokenKey = getRefreshTokenKey()
  if (!refreshTokenKey) {
    clearAccessToken();
    return false
  }

  const resp = await authApi.refreshToken({ 
    refresh_token_key: refreshTokenKey
   });

  if (resp.status === "error") {
    clearAccessToken();
    clearRefreshTokenKey();
    return false;
  }

  const accessToken = resp.data.access;
  setAccessToken(accessToken);
  return accessToken;
};

export const verifyToken = async (token) => {
  try {
    // Avoid remote verify if we have a recent cached verification
    const cached = readVerifyCache(token);
    if (cached !== null) return cached;

    if (token) {
      const resp = await authApi.verifyToken(token);
      if (resp.code == 200) {
        setVerifyCache(token, true);
        return true;
      }
    }

    const accessToken = await refreshNewToken();
    const verified = !!accessToken;
    setVerifyCache(verified ? accessToken : undefined, verified);

    return verified;
  } catch (e) {
    return false;
  }
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
