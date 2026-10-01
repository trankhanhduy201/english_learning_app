import { callApi } from "./apiService";

export const getDashboardSummary = async (options = {}) => {
  return await callApi("dashboard/summary", {
    method: "GET",
    ...options,
  });
};
