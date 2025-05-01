import { setLang } from "../slices/langSlice";
import * as lsUtils from "../../utils/localStorage";

export const setLangThunk = (lang) => (dispatch) => {
  dispatch(setLang(lang));
  lsUtils.setLang(lang);
};
