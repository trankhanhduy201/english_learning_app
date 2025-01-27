import Cookies from "js-cookie";

export const TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export const setAuthTokens = (newToken, newRefresh, expireDays = 7) => {
  Cookies.set(TOKEN_KEY, newToken, { expires: expireDays, secure: true });
  Cookies.set(REFRESH_TOKEN_KEY, newRefresh, { expires: expireDays, secure: true });
};

export const getAuthTokens = () => {
  return {
    token: Cookies.get(TOKEN_KEY),
    refreshToken: Cookies.get(REFRESH_TOKEN_KEY),
  };
};

export const clearAuthTokens = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
