import store from "../../stores/store";
import { registerThunk } from "../../stores/actions/authAction";

export const register = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const username = (data.username ?? "").trim();
  const firstName = (data.firstname ?? "").trim();
  const lastName = (data.lastname ?? "").trim();
  const password = data.password ?? "";
  const rePassword = data.re_password ?? "";

  const errors = {};
  if (!username) errors.username = ["Username is required."];
  if (!firstName) errors.first_name = ["First name is required."];
  if (!lastName) errors.last_name = ["Last name is required."];
  if (!password) errors.password = ["Password is required."];
  if (password && rePassword && password !== rePassword) {
    errors.password = [...(errors.password ?? []), "Passwords do not match."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      errors,
    };
  }

  try {
    return await store
      .dispatch(
        registerThunk({
          username,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      )
      .unwrap();
  } catch (err) {
    return err;
  }
};
