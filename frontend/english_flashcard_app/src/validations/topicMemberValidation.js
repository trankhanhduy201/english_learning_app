import * as yup from "yup";
import { SUBCRIBER_STATUS } from "../configs/appConfig";
import { validateWithSchema } from "./base";
import { parseJsonObjectValues } from "../utils/commons";

const MEMBER_STATUS_KEYS = Object.values(SUBCRIBER_STATUS).map((item) => item.key);

const topicMemberItemSchema = yup
  .object({
    member_id: yup
      .number()
      .typeError("Member id is invalid.")
      .required("Member id is required."),
    member: yup.number().typeError("Member is invalid.").nullable(),
    status: yup
      .string()
      .transform((value) => (value ?? "").toString().trim())
      .oneOf(MEMBER_STATUS_KEYS, "Member status is invalid.")
      .required("Member status is required."),
    is_remove: yup
      .boolean()
      .transform((_value, originalValue) => {
        if (typeof originalValue === "boolean") return originalValue;
        const raw = (originalValue ?? "").toString().toLowerCase();
        return raw === "true" || raw === "1";
      })
      .default(false),
  })
  .required();

export const topicMemberUpdateSchema = yup
  .object({
    updating_member_data: yup
      .array()
      .transform((_value, originalValue) => {
        const parsedValues = parseJsonObjectValues(originalValue);
        return Array.isArray(parsedValues) ? parsedValues : null;
      })
      .of(topicMemberItemSchema)
      .nullable()
      .required("Updating member data is required.")
      .min(1, "Updating member data is invalid."),
  })
  .required();

export const validateTopicMemberUpdate = async (data) => {
  return validateWithSchema(topicMemberUpdateSchema, {
    updating_member_data: data?.updating_member_data,
  });
};
