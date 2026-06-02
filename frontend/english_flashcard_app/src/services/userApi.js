import { callApi } from "./apiService";

export const getProfile = async (options = {}) => {
  return await callApi("account/", {
    method: "GET",
    ...options,
  });
};

export const updateProfile = async (data, options = {}) => {
  return await callApi("account/", {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
};

export const generateSignature = async (options = {}) => {
  return await callApi("account/signature", {
    method: "GET",
    ...options,
  });
};