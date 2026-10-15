import { callApi } from "./apiService";

export const issueWebSocketTicket = async (options = {}) => {
  return await callApi("notifications/ws-ticket/", {
    method: "POST",
    ...options,
  });
};
