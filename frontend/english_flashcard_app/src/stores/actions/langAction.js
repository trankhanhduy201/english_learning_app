import { setLang } from "../slices/langSlice";
import { clearTopics, setIsFetched } from "../slices/topicSlice";
import { setLang as setLangLocalStorage } from "../../commons/localStorage";

export const setLangThunk = (lang) => (dispatch) => {
  dispatch(setIsFetched(false));
  dispatch(clearTopics());
  dispatch(setLang(lang));
  setLangLocalStorage(lang);
};
