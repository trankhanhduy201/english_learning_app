import { callApi } from "./apiService";

export const getProfile = async (options = {}) => {
  return await callApi("user/profile", {
    method: "GET",
    ...options,
  });
};

export const updateProfile = async (data, options = {}) => {
  return await callApi("user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
};

export const generateSignature = async (data, options = {}) => {
  return await callApi("user/gen-signature", {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
};