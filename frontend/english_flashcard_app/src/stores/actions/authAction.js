import { createThunkWithCallback, rejectWithErrorValue } from "./commonAction";
import { setAlert } from "../slices/alertSlice";
import { getToken as getTokenApi } from "../../services/authApi";
import { SUCCESS_TYPE } from "../../configs/alertConfig";
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
    dispatch(
      setAlert({
        type: SUCCESS_TYPE,
        message: `Hi ${username}, wellcome back!`,
      }),
    );
    return response;
  },
);
