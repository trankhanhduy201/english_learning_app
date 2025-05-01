import { configureStore } from '@reduxjs/toolkit';
import { verifyTokenMiddleware } from './middlewares/tokenMiddleware';
import alertReducers from './slices/alertSlice';
import langReducers from './slices/langSlice';
import topicsReducers from './slices/topicsSlice';
import authReducers from './slices/authSlice';
import sidebarReducers from './slices/sidebarSlice';

const store = configureStore({
  reducer: {
    alerts: alertReducers,
    lang: langReducers,
    topics: topicsReducers,
    auth: authReducers,
    sidebar: sidebarReducers
  },
  // middleware: (getDefaultMiddleware) => 
  //   getDefaultMiddleware().concat(verifyTokenMiddleware),
});

export default store;
