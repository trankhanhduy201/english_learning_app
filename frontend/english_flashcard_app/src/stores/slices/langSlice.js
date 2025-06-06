import { createSlice } from "@reduxjs/toolkit";
import { setLangReducer } from "../reducers/langReducer";
import { getLang } from "../../utils/localStorage";


const langSlice = createSlice({
  name: "lang",
  initialState: getLang(),
  reducers: {
    setLang: setLangReducer,
  },
});

export const { setLang } = langSlice.actions;
export default langSlice.reducer;
