import store from "../../stores/store";
import { updateProfileThunk } from "../../stores/actions/userAction";
import { blobToBase64 } from "../../commons/images";

export const updateProfile = async ({ request }) => {
  const formData = await request.formData();

  const firstName = (formData.get("first_name") ?? "").toString().trim();
  const lastName = (formData.get("last_name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim();
  const avatar = formData.get("avatar");
  const avatarRemove = (formData.get("avatar_remove") ?? "").toString() === "1";

  const errors = {};
  if (!firstName) errors.first_name = ["First name is required."];
  if (!lastName) errors.last_name = ["Last name is required."];
  if (!email) errors.email = ["Email is required."];

  if (avatar && avatar instanceof File && avatar.size > 0) {
    const maxSizeBytes = 5 * 1024 * 1024;
    if (avatar.size > maxSizeBytes) {
      errors.avatar = ["Avatar file is too large (max 5MB)."];
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      errors,
    };
  }

  try {
    const hasAvatarFile = avatar && avatar instanceof File && avatar.size > 0;
    const data = {
      first_name: firstName,
      last_name: lastName,
      email,
    };

    if (avatarRemove) {
      data.avatar = null;
    } else if (hasAvatarFile) {
      data.avatar = await blobToBase64(avatar);
    }
    
    return await store.dispatch(
      updateProfileThunk({ data })
    ).unwrap();
  } catch (err) {
    return err;
  }
};
