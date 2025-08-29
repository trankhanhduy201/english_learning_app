import { redirect } from "react-router-dom";
import { loginThunk, logoutThunk } from "../../stores/actions/authAction";
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

export const logout = async ({ request, param }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const revokeTokens = parseInt(data?.revoke_tokens) ? true : false;

  try {
    const resp = await store.dispatch(logoutThunk({ revokeTokens })).unwrap();
    return redirect(`/login`);
  } catch (err) {
    return err;
  }
};
