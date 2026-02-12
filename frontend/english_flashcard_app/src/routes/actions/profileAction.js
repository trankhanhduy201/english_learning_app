import store from "../../stores/store";
import { updateProfileThunk } from "../../stores/actions/userAction";
import { blobToBase64 } from "../../commons/images";
import { validateUpdateProfile } from "../../validations/profileValidation";

export const updateProfile = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const { validatedData, errors } = await validateUpdateProfile(data);
  if (errors) {
    return {
      status: "error",
      errors,
    };
  }

  try {
    const removeAvatar = validatedData.avatar_remove;
    delete validatedData.avatar_remove;

    if (removeAvatar) {
      validatedData.avatar = null;
    } else if (validatedData.avatar) {
      validatedData.avatar = await blobToBase64(validatedData.avatar);
    } else {
      delete validatedData.avatar;
    }

    return await store.dispatch(
      updateProfileThunk({ data: validatedData })
    ).unwrap();
  } catch (err) {
    return err;
  }
};
