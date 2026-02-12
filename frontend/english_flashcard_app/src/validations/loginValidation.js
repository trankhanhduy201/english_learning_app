import * as yup from "yup";
import { validateWithSchema } from "./base";

export const loginSchema = yup
  .object({
    username: yup
      .string()
      .transform((value) => (value ?? "").trim())
      .required("Username is required."),
    password: yup
      .string()
      .transform((value) => (value ?? "").trim())
      .required("Password is required."),
  })
  .required();

export const validateLogin = async (data) => {
  return validateWithSchema(loginSchema, {
    username: data?.username,
    password: data?.password,
  });
};
