import { configureStore } from "@reduxjs/toolkit";
// import { verifyTokenMiddleware } from "./middlewares/tokenMiddleware";
import alertSlice from "./slices/alertSlice";
import langSlice from "./slices/langSlice";
import sidebarSlice from "./slices/sidebarSlice";

const store = configureStore({
  reducer: {
    alerts: alertSlice,
    lang: langSlice,
    sidebar: sidebarSlice
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(verifyTokenMiddleware),
});

export default store;
