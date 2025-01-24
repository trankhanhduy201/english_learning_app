import Layout from "../pages/Layout";
import * as authApi from "../services/authApi";
import { Navigate } from "react-router-dom";
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_auth_token';
const EXPIRE_MINUTES = 60; 

const PrivateRoute = () => {
  const token = Cookies.get(TOKEN_KEY);
  const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
  const expireDays = EXPIRE_MINUTES / 1440;

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

  const verifyToken = async (token) => {
    const resp = await authApi.verifyToken(token, { throwEx: false });
    if (resp.code == 200) {
      return true;
    }

    const { newToken, newRefresh } = await refreshNewToken(refreshToken, { throwEx: false });
    if (newToken) {
      Cookies.set(TOKEN_KEY, newToken, { expires: expireDays, secure: true });
      Cookies.set(REFRESH_TOKEN_KEY, newRefresh, { expires: expireDays, secure: true });
      return true;
    }

    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    return false;
  }

  if (!token || !verifyToken(token)) {
    return <Navigate to='/login' />;
  }
  return <Layout />;
};

export default PrivateRoute;
