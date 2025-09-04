import { callApi } from "./apiService";

export const getInfo = async (options = {}) => {
  return await callApi("user/info", {
    method: "GET",
    ...options,
  });
};

export const generateSignature = async (datas, options = {}) => {
  return await callApi("user/gen-signature", {
    method: "POST",
    body: JSON.stringify(datas),
    ...options,
  });
};