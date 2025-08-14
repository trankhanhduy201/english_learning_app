import { redirect } from "react-router-dom";
import { loginThunk } from "../../stores/actions/authAction";
import store from "../../stores/store";

export const login = async ({ request, param }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const resp = await store.dispatch(loginThunk(data)).unwrap();
    return redirect(`/dashboard`);
  } catch (err) {
    return err;
  }
};
