import { createAction, createSlice } from "@reduxjs/toolkit";
import { WS_STATUS } from "../../configs/notificationSocketConfig";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../actions/notificationAction";
import { generateUniqueId } from "../../utils/commons";

const syncUnreadCount = (state) => {
  state.unreadCount = (state.items || []).filter((item) => !item.is_read).length;
};

const normalizeNotification = (item) => {
  if (!item) return null;

  return {
    id: Number(item.id),
    title: item.title || "Notification",
    message: item.message || "",
    is_read: Boolean(item.is_read),
    created_at: item.created_at || new Date().toISOString(),
  };
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
    websocketStatus: WS_STATUS.DISCONNECTED,
    lastSocketMessage: null,
  },
  reducers: {
    setWebSocketStatus: (state, action) => {
      state.websocketStatus = action.payload;
    },
    setNotificationItems: (state, action) => {
      state.items = (action.payload || []).map(normalizeNotification).filter(Boolean);
      syncUnreadCount(state);
    },
    appendNotification: (state, action) => {
      const payload = action.payload;
      const nextItem = normalizeNotification(payload?.notification);

      state.lastSocketMessage = {
        ...payload,
        message_id: generateUniqueId(),
        status: "pending",
      };

      if (!nextItem) {
        return;
      }

      const existingIndex = state.items.findIndex(
        (item) => Number(item.id) === Number(nextItem.id),
      );

      if (existingIndex >= 0) {
        state.items[existingIndex] = { ...state.items[existingIndex], ...nextItem };
      } else {
        state.items = [nextItem, ...state.items];
      }

      syncUnreadCount(state);
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.lastSocketMessage = null;
      state.error = null;
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
    markLastSocketMessageAsReceived: (state, action) => {
      const messageId = action.payload?.id;

      if (!state.lastSocketMessage || !messageId) {
        return;
      }

      if (state.lastSocketMessage.message_id !== messageId) {
        return;
      }

      state.lastSocketMessage = {
        ...state.lastSocketMessage,
        status: "received",
      };
    },
    markNotificationReadLocally: (state, action) => {
      const id = Number(action.payload);
      const item = state.items.find((entry) => Number(entry.id) === id);

      if (item) {
        item.is_read = true;
        syncUnreadCount(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = (action.payload || []).map(normalizeNotification).filter(Boolean);
        syncUnreadCount(state);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to fetch notifications.";
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const nextItem = normalizeNotification(action.payload);

        if (!nextItem) {
          return;
        }

        const item = state.items.find(
          (entry) => Number(entry.id) === Number(nextItem.id),
        );

        if (item) {
          item.is_read = true;
          item.title = nextItem.title;
          item.message = nextItem.message;
          item.created_at = nextItem.created_at;
        }

        syncUnreadCount(state);
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to mark notification as read.";
      });
  },
});

export const {
  setWebSocketStatus,
  setNotificationItems,
  appendNotification,
  clearNotifications,
  clearNotificationError,
  markLastSocketMessageAsReceived,
  markNotificationReadLocally,
} = notificationSlice.actions;

export const connectNotificationSocket = createAction("notification/connect");
export const disconnectNotificationSocket = createAction("notification/disconnect");

export default notificationSlice.reducer;
