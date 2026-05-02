import * as yup from "yup";
import { validateWithSchema } from "./base";
import { LANGUAGES } from "../configs/langConfig";
import { getDatas as getTransType } from "../enums/transType";

const LANGUAGE_KEYS = Object.values(LANGUAGES).map((item) => item.key);
const TRANS_TYPES = getTransType().map((item) => item.key);

const translationItemSchema = yup.object({
  language: yup
    .string()
    .transform((v) => (v ?? "").toString().trim())
    .oneOf(LANGUAGE_KEYS, "Invalid translation language.")
    .required("Translation language is required."),
  translation: yup
    .string()
    .transform((v) => (v ?? "").toString().trim())
    .required("Translation text is required."),
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

export const vocabDetailSchema = yup
  .object({
    word: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .required("Word is required."),
    language: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .oneOf(LANGUAGE_KEYS, "Language is invalid.")
      .required("Language is required."),
    descriptions: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .nullable(),
    translations: yup
      .object()
      .required("Translations are required.")
      .test("notEmpty", "At least one translation is required.", (value) => {
        if (!value || typeof value !== "object") return false;

        return Object.values(value).some(
          (langObj) =>
            langObj &&
            typeof langObj === "object" &&
            Object.keys(langObj).length > 0
        );
      })
      .shape(
        Object.fromEntries(
          LANGUAGE_KEYS.map((lang) => [
            lang,
            yup.lazy((value) => {
              if (!value || typeof value !== "object") {
                return yup.object().optional();
              }

              const keys = Object.keys(value);

              // enforce at least one item inside each language (optional)
              if (keys.length === 0) {
                return yup.object().test(
                  "notEmpty",
                  `${lang} must have at least one translation`,
                  () => false
                );
              }

              const shape = keys.reduce((acc, key) => {
                acc[key] = translationItemSchema;
                return acc;
              }, {});

              return yup.object().shape(shape);
            }),
          ])
        )
      )
  })
  .required();

export const validateVocabDetail = async (rawData) => {
  return validateWithSchema(vocabDetailSchema, {
    word: rawData?.word,
    language: rawData?.language,
    descriptions: rawData?.descriptions,
    translations: rawData?.translations,
  });
};