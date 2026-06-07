import Cookies from "js-cookie";

export const TOKEN_KEY = "token";

export const setAccessToken = (newToken) => {
  Cookies.set(TOKEN_KEY, newToken);
};

export const getAccessToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const clearAccessToken = () => {
  Cookies.remove(TOKEN_KEY);
};
