import { useEffect, useState } from "react";
import * as authApi from "../services/authApi";
import * as cookies from "../utils/cookies";
import * as jwtUtils from "../utils/jwt";

const refreshNewToken = async (refresh) => {
  let newTokenData = {};
  if (!refresh) {
    return newTokenData;
  }
  
  const resp = await authApi.refreshToken(refresh, { throwEx: false });
  if (resp.code == 200) {
    newTokenData = resp.data;
  }

  return newTokenData;
}

const verifyToken = async (token, refreshToken) => {
  const resp = await authApi.verifyToken(token, { throwEx: false });
  if (resp.code == 200) {
    return true;
  }

  const { access } = await refreshNewToken(refreshToken, { throwEx: false });
  if (access) {
    cookies.setAccessToken(access);
    return true;
  }

  cookies.clearAuthTokens();
  return false;
}

const localVerifyToken = async (token, refreshToken) => {
  if (jwtUtils.checkTokenExpire(token)) {
    return true;
  }

  if (!jwtUtils.checkTokenExpire(refreshToken)) {
    return false;
  }

  const { access } = await refreshNewToken(refreshToken, { throwEx: false });
  if (access) {
    cookies.setAccessToken(access);
    return true;
  }

  cookies.clearAuthTokens();
  return false;
}

const useCheckAuth = () => {
  const [ isAuth, setIsAuth ] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const { token, refreshToken } = cookies.getAuthTokens();
      const verified = await verifyToken(token, refreshToken);
      setIsAuth(verified);
    }

    const verifyInterval = async () => {
      const { token, refreshToken } = cookies.getAuthTokens();
      const verified = await localVerifyToken(token, refreshToken);
      setIsAuth(verified);
    }

    setIsAuth(null);
    verify();

    const interval = setInterval(() => verifyInterval(), 60000);
    return () => clearInterval(interval);
  }, []);

  return { isAuth };
}

export default useCheckAuth;