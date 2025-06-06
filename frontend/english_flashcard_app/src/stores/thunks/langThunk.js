import { setLang } from "../slices/langSlice";
import { clearTopics, setIsFetched } from "../slices/topicsSlice";
import * as lsUtils from "../../utils/localStorage";

export const setLangThunk = (lang) => (dispatch) => {
  dispatch(setIsFetched(false));
  dispatch(clearTopics());
  dispatch(setLang(lang));
  lsUtils.setLang(lang);
};
