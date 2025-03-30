import { createSlice } from '@reduxjs/toolkit';
import { setLangReducer } from '../reducers/langReducer';
import { DEFAULT_LANG } from '../../configs/langConfigs';

const langSlice = createSlice({
  name: 'lang',
  initialState: DEFAULT_LANG,
  reducers: {
    setLang: setLangReducer
  },
});

export const { setLang } = langSlice.actions;
export default langSlice.reducer;