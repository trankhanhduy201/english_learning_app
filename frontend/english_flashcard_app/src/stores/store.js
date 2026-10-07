import { configureStore } from "@reduxjs/toolkit";
// import { verifyTokenMiddleware } from "./middlewares/tokenMiddleware";
import alertSlice from "./slices/alertSlice";
import langSlice from "./slices/langSlice";
import sidebarSlice from "./slices/sidebarSlice";
import userSlice from "./slices/userSlice";

const store = configureStore({
  reducer: {
    alerts: alertSlice,
    lang: langSlice,
    sidebar: sidebarSlice,
    user: userSlice,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(verifyTokenMiddleware),
});

export default store;
