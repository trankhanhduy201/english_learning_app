import * as yup from "yup";
import { isImageFile, validateWithSchema } from "./base";
import { LANGUAGES } from "../configs/langConfig";
import { TOPIC_STATUS } from "../configs/appConfig";

const MAX_TOPIC_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const LANGUAGE_KEYS = Object.values(LANGUAGES).map((item) => item.key);
const TOPIC_STATUS_KEYS = Object.values(TOPIC_STATUS).map((item) => item.key);

export const topicDetailSchema = yup
  .object({
    name: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .required("Topic name is required."),
    learning_language: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .oneOf(LANGUAGE_KEYS, "Learning language is invalid.")
      .required("Learning language is required."),
    descriptions: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .nullable(),
    status: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .oneOf(TOPIC_STATUS_KEYS, "Status is invalid.")
      .required("Status is required."),
    image_remove: yup
      .boolean()
      .transform((_value, originalValue) => {
        const raw = (originalValue ?? "").toString();
        return raw === "1" || raw.toLowerCase() === "true";
      })
      .default(false),
    upload_image: yup
      .mixed()
      .transform((_value, originalValue) => {
        if (originalValue instanceof File && originalValue.size === 0) return null;
        return originalValue;
      })
      .nullable()
      .test("fileType", "Only image files are allowed.", (value) => {
        if (value == null) return true;
        return isImageFile(value);
      })
      .test(
        "fileSize",
        "Image file is too large (max 5MB).",
        (value) => {
          if (value == null) return true;
          if (!(value instanceof File)) return false;
          return value.size <= MAX_TOPIC_IMAGE_SIZE_BYTES;
        },
      ),
  })
  .required();

export const validateTopicDetail = async (rawData) => {
  return validateWithSchema(topicDetailSchema, {
    name: rawData?.name,
    learning_language: rawData?.learning_language,
    descriptions: rawData?.descriptions,
    status: rawData?.status,
    image_remove: rawData?.image_remove,
    upload_image: rawData?.image,
  });
};
