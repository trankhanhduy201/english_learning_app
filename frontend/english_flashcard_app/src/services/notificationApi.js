import { callApi } from "./apiService";

export const getNotifications = async (options = {}) => {
  return await callApi("notifications/", {
    method: "GET",
    ...options,
  });
};

export const markNotificationAsRead = async (notificationId, options = {}) => {
  return await callApi(`notifications/${notificationId}/read`, {
    method: "POST",
    ...options,
  });
};
