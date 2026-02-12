import * as yup from "yup";
import { validateWithSchema } from "./base";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const isImageFile = (file) => {
  if (!(file instanceof File)) return false;

  const mimeType = (file.type ?? "").toLowerCase();
  if (mimeType) return mimeType.startsWith("image/");

  const name = (file.name ?? "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name);
};

export const updateProfileSchema = yup
  .object({
    first_name: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .required("First name is required."),
    last_name: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .required("Last name is required."),
    email: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .required("Email is required.")
      .email("Email is invalid."),
    avatar_remove: yup
      .boolean()
      .transform((_value, originalValue) => {
        const raw = (originalValue ?? "").toString();
        return raw === "1" || raw.toLowerCase() === "true";
      })
      .default(false),
    avatar: yup
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
        "Avatar file is too large (max 5MB).",
        (value) => {
          if (value == null) return true;
          if (!(value instanceof File)) return false;
          return value.size <= MAX_AVATAR_SIZE_BYTES;
        },
      ),

    bio: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .nullable(),
  })
  .required();

export const validateUpdateProfile = async (data) => {
  return validateWithSchema(updateProfileSchema, {
    first_name: data?.first_name,
    last_name: data?.last_name,
    email: data?.email,
    avatar: data?.avatar,
    avatar_remove: data?.avatar_remove,
    bio: data?.bio,
  });
};
