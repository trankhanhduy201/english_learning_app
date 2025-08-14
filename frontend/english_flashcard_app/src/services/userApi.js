import { callApi } from "./apiService";

export const getInfo = async (options = {}) => {
  return await callApi("user/info", {
    method: "GET",
    ...options,
  });
};