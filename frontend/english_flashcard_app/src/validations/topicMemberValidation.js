import * as yup from "yup";
import { SUBCRIBER_STATUS } from "../configs/appConfig";
import { validateWithSchema } from "./base";
import { parseJson } from "../utils/commons";

const MEMBER_STATUS_KEYS = Object.values(SUBCRIBER_STATUS).map(
  (item) => item.key
);

const topicMemberItemSchema = yup
  .object({
    id: yup
      .number()
      .typeError("Id is invalid.")
      .required("Id is required."),
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

const topicMemberDataSchema = yup
  .mixed()
  .transform((_value, originalValue) => {
    const parseData = parseJson(originalValue);
    if (parseData === null) return null;

    const parseDataValues = Object.values(parseData);
    if (parseDataValues.length === 0) return null;

    if (typeof parseDataValues[0] === "object") {
      return parseDataValues;
    }
    return parseData;
  })
  .test({
    name: "topic-member-data",
    test(value) {
      return yup.lazy((val) => {
        if (Array.isArray(val)) {
          return yup
            .array()
            .of(topicMemberItemSchema)
            .min(1, "Updating member data is invalid.")
            .required("Updating member data is required.");
        }
        
        return topicMemberItemSchema.required(
          "Updating member data is required."
        );
      }).validateSync(value);
    },
  });

export const topicMemberUpdateSchema = yup
  .object({
    updating_member_data: topicMemberDataSchema.required(
      "Updating member data is required."
    ),
  })
  .required();

export const validateTopicMemberUpdate = async (data) => {
  return validateWithSchema(topicMemberUpdateSchema, {
    updating_member_data: data?.updating_member_data,
  });
};