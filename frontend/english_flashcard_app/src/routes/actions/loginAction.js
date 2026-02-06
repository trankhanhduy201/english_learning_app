import { redirect } from "react-router-dom";
import { loginThunk, logoutThunk } from "../../stores/actions/authAction";
import store from "../../stores/store";

export const login = async ({ request, param }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const username = (data.username ?? "").trim();
  const password = data.password ?? "";

  const errors = {};
  if (!username) errors.username = ["Username is required."];
  if (!password) errors.password = ["Password is required."];

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      errors,
    };
  }

  try {
    const resp = await store
      .dispatch(
        loginThunk({
          username,
          password,
        }),
      )
      .unwrap();
    return redirect(`/dashboard`);
  } catch (err) {
    return err;
  }
};

export const logout = async ({ request, param }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const revokeTokens = parseInt(data?.revoke_tokens ?? 0) ? true : false;

  try {
    const resp = await store.dispatch(logoutThunk({ revokeTokens })).unwrap();
    return redirect(`/login`);
  } catch (err) {
    return err;
  }
};
