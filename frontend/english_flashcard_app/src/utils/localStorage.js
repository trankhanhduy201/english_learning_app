import { DEFAULT_LANG } from "../configs/langConfigs";

export const getValue = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
};

export const setValue = (key, value) => localStorage.setItem(key, value);

export const getLang = () => getValue("lang", DEFAULT_LANG);

export const setLang = (value) => setValue("lang", value);
