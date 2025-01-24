import { callApi } from "./apiService";

export const getToken = async (username, password, options = {}) => {
  return await callApi('api/token', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }, options?.throwEx || true);
}

export const verifyToken = async (token, options = {}) => {
  console.log(options);
  return await callApi('api/token/verify', {
    method: 'POST',
    body: JSON.stringify({ token })
  }, options?.throwEx || true);
};

export const refreshToken = async (refresh, options = {}) => {
  return await callApi('api/token/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh })
  }, options?.throwEx || true);
};