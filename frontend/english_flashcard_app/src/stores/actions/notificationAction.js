import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  markNotificationAsRead as markNotificationAsReadApi,
} from "../../services/notificationApi";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    const response = await getNotifications();

    if (response.status === "error") {
      return rejectWithValue(response.error || "Unable to fetch notifications.");
    }

    return Array.isArray(response.data) ? response.data : response.data || [];
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    const response = await markNotificationAsReadApi(notificationId);

    if (response.status === "error") {
      return rejectWithValue(response.error || "Unable to mark notification as read.");
    }

    return response.data || null;
  },
);
