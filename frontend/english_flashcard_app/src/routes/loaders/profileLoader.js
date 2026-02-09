import store from "../../stores/store";
import { getProfileThunk } from "../../stores/actions/userAction";

export const getProfile = async () => {
  try {
    const profileData = store
      .dispatch(getProfileThunk())
      .unwrap()
      .then((resp) => resp.data);

    return { profileData };
  } catch (error) {
    throw new Response("", { status: 400 });
  }
};
