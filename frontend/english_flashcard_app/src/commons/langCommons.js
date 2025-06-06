import { DEFAULT_LANG } from "../configs/langConfigs";
import store from "../stores/store";

export const getLang = () => store.getState().lang ?? DEFAULT_LANG;