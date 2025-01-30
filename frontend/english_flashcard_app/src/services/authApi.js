import { callApi } from "./apiService";

export const getToken = async (username, password, options = {}) => {
  return await callApi('token', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    ...options
  });
}

export const verifyToken = async (token, options = {}) => {
  return await callApi('token/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
    ...options
  });
};

export const refreshToken = async (refresh, options = {}) => {
  return await callApi('token/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
    ...options
  });
};

export const getUserInfo = async (token, options = {}) => {
  return await callApi('user', {
    method: 'GET',
    ...options
  });
}