import { callApi } from "./apiService";

export const getToken = async (username, password, options = {}) => {
  return await callApi("token/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    credentials: "include",
    ...options,
  });
};

export const verifyToken = async (token, options = {}) => {
  return await callApi("token/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
    ...options,
  });
};

export const refreshToken = async (data, options = {}) => {
  return await callApi("token/refresh", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
    ...options,
  });
};

export const revokeTokens = async (data, options = {}) => {
  return await callApi("token/revoke", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
    ...options,
  });
};

export const registerUser = async (userInfo, options = {}) => {
  return await callApi("account/", {
    method: "POST",
    body: JSON.stringify(userInfo),
    ...options,
  });
};
