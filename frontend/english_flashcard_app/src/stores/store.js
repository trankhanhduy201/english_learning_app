import { configureStore } from "@reduxjs/toolkit";
// import { verifyTokenMiddleware } from "./middlewares/tokenMiddleware";
import alertSlice from "./slices/alertSlice";
import langSlice from "./slices/langSlice";
import topicSlice from "./slices/topicSlice";
import authSlice from "./slices/authSlice";
import sidebarSlice from "./slices/sidebarSlice";

const store = configureStore({
  reducer: {
    alerts: alertSlice,
    lang: langSlice,
    topics: topicSlice,
    auth: authSlice,
    sidebar: sidebarSlice
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(verifyTokenMiddleware),
});

export default store;
