import { createSlice } from "@reduxjs/toolkit";
import { setToggleSidebarReducer } from "../reducers/sidebarReducer";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    isOpen: false,
  },
  reducers: {
    toggleSidebar: setToggleSidebarReducer,
  },
});

export const { toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
