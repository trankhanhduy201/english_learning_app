import { DEFAULT_LANG } from "../configs/langConfigs";

export const getLang = () => {
  try {
    const value = localStorage.getItem('lang');
    return value ?? DEFAULT_LANG;
  } catch (err) {
    console.error('Error reading lang from localStorage', err);
    return DEFAULT_LANG;
  }
};

export const setLang = (value) => {
  localStorage.setItem('lang', value);
};