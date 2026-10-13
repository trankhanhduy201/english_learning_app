import { configureStore } from "@reduxjs/toolkit";
import notificationMiddleware from "./middlewares/notificationMiddleware";
import alertSlice from "./slices/alertSlice";
import langSlice from "./slices/langSlice";
import notificationSlice from "./slices/notificationSlice";
import sidebarSlice from "./slices/sidebarSlice";
import userSlice from "./slices/userSlice";

const store = configureStore({
  reducer: {
    alerts: alertSlice,
    lang: langSlice,
    notifications: notificationSlice,
    sidebar: sidebarSlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationMiddleware),
});

export default store;
