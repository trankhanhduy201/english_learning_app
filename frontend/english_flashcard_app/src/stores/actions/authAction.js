import { createThunkWithCallback, rejectWithErrorValue, dispatchSuccessAlert } from "./commonAction";
import { getToken as getTokenApi } from "../../services/authApi";
import { setAuthTokens as setAuthTokensCookie } from "../../commons/cookies";
import { getUserInfo } from "../../commons/token";
import { setUser as setUserLocalStorage } from "../../commons/localStorage";

export const loginThunk = createThunkWithCallback(
  "auth/login",
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    const response = await getTokenApi(username, password);
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    
    const userInfo = getUserInfo(response.data.access);
    console.log("getUserInfo", userInfo);
    if (!userInfo) {
      return rejectWithErrorValue(
        dispatch,
        rejectWithValue,
        response,
        "Invalid user info",
      );
    }
    
    setAuthTokensCookie(response.data.access, response.data.refresh);
    setUserLocalStorage(userInfo);
    dispatchSuccessAlert(dispatch, `Hi ${userInfo?.full_name}, wellcome back!`);
    return response;
  },
);
