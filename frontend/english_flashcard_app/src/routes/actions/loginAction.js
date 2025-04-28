import { redirect } from "react-router-dom";
import { loginThunk } from "../../stores/thunks/authThunk";
import store from "../../stores/store";
import * as cookies from "../../utils/cookies";
import { setUserInfo } from "../../stores/slices/authSlice";

export const login = async ({ request, param }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const resp = await store.dispatch(loginThunk(data)).unwrap();
    cookies.setAuthTokens(resp.data.access, resp.data.refresh);
    store.dispatch(setUserInfo(data.username));
    return redirect(`/`);
  } catch (err) {
    return err;
  }
}