import { createThunkWithCallback, rejectWithErrorValue, dispatchSuccessAlert } from "./commonAction";
import { getToken as getTokenApi, registerUser as registerUserApi } from "../../services/authApi";
import { 
  setAccessToken as setAccessTokenCookie, 
  clearAccessToken as clearAccessTokenCookie 
} from "../../commons/token";
import { getUserInfo, writeVerifyCache as setVerifyCache, clearVerifyCache } from "../../commons/token";
import { 
  setUser as setUserLocalStorage,
} from "../../commons/localStorage";
import { revokeTokensThunk } from "./tokenAction";

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
    
    setAccessTokenCookie(response.data.access);
    setVerifyCache(response.data.access, true);
    setUserLocalStorage(userInfo);
    dispatchSuccessAlert(dispatch, `Hi ${userInfo?.full_name}, wellcome back!`);
    return response;
  },
);

export const logoutThunk = createThunkWithCallback(
  "auth/logout",
  async ({ revokeTokenPermanent }, { dispatch, rejectWithValue }) => {
    const response = await dispatch(
      revokeTokensThunk({ permanent: revokeTokenPermanent })
    ).unwrap();

    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    
    clearAccessTokenCookie();
    clearVerifyCache();
    setUserLocalStorage({});
    return {
      status: 'success',
    };
  },
);

export const registerThunk = createThunkWithCallback(
  "auth/register",
  async ({ username, password, first_name, last_name }, { dispatch, rejectWithValue }) => {
    const response = await registerUserApi({
      username,
      password,
      first_name,
      last_name,
    });
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }

    dispatchSuccessAlert(dispatch, "Account created successfully");
    return response;
  },
);
