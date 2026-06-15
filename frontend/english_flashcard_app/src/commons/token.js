import * as authApi from "../services/authApi";
import * as jwtUtils from "./jwt";
import * as cookieUtils from "../commons/cookies";
import { TOKEN_VERIFY_EXPIRE } from "../configs/appConfig";
import { clearValue, getValue, setValue } from "./localStorage";

const CACHE_KEY = "token_verify_cache";

const readVerifyCache = (token) => {
  const parsed = getValue(CACHE_KEY, null);
  if (!parsed) return null;
  if (
    parsed &&
    parsed.at &&
    parsed.token === token &&
    Date.now() - parsed.at < TOKEN_VERIFY_EXPIRE
  ) {
    return parsed.verified;
  }
  return null;
};

export const writeVerifyCache = (token, verified) => {
  setValue(CACHE_KEY, JSON.stringify({ at: Date.now(), verified, token }));
};

export const clearVerifyCache = () => {
  clearValue(CACHE_KEY);
};

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
  try {
    // Avoid remote verify if we have a recent cached verification
    const cached = readVerifyCache(token);
    if (cached !== null) return cached;

    if (token) {
      const resp = await authApi.verifyToken(token);
      if (resp.code == 200) {
        writeVerifyCache(token, true);
        return true;
      }
    }

    const accessToken = await refreshNewToken();
    const verified = !!accessToken;
    if (verified) {
      writeVerifyCache(accessToken, true);
    }
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
