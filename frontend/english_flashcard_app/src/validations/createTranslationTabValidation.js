import * as yup from "yup";
import { validateWithSchema } from "./base";
import { LANGUAGES } from "../configs/langConfig";
import { getDatas as getTransType } from "../enums/transType";

const LANGUAGE_KEYS = Object.values(LANGUAGES).map((item) => item.key);
const TRANS_TYPES = getTransType().map((item) => item.key);

const translationSchema = yup.object({
  translation: yup
    .string()
    .transform((value) => (value ?? "").toString().trim())
    .required("Translation is required."),
  language: yup
    .string()
    .transform((value) => (value ?? "").toString().trim())
    .oneOf(LANGUAGE_KEYS, "Language is invalid.")
    .required("Language is required."),
  type: yup
    .string()
    .transform((value) => {
      const v = (value ?? "").toString().trim();
      return v === "" ? null : v;
    })
    .oneOf(TRANS_TYPES, "Type is invalid.")
    .nullable(),
  note: yup
    .string()
    .transform((value) => (value ?? "").toString().trim())
    .nullable(),
});

export const validateCreateTranslationTab = async (rawData) => {
  return validateWithSchema(translationSchema, {
    translation: rawData?.translation,
    language: rawData?.language,
    type: rawData?.type,
    note: rawData?.note,
  });
};
