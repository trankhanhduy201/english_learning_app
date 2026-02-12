import { redirect } from "react-router-dom";
import { loginThunk, logoutThunk } from "../../stores/actions/authAction";
import store from "../../stores/store";
import { validateLogin } from "../../validations/loginValidation";

export const login = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const { validatedData, errors } = await validateLogin(data);
  if (errors) {
    return {
      status: "error",
      errors,
    };
  }

  try {
    await store.dispatch(loginThunk({ ...validatedData })).unwrap();
    return redirect("/dashboard");
  } catch (err) {
    return err;
  }
};

export const logout = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const revokeTokens = Boolean(Number(data?.revoke_tokens ?? 0));

  try {
    await store.dispatch(logoutThunk({ revokeTokens })).unwrap();
    return redirect("/login");
  } catch (err) {
    return err;
  }
};
