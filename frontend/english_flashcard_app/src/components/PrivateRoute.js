import Layout from "../pages/Layout";
import * as authApi from "../services/authApi";
import { Navigate, useNavigate } from "react-router-dom";
import * as cookies from "../utils/cookies";

const PrivateRoute = () => {
  const { token, refreshToken } = cookies.getAuthTokens();
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
      cookies.setAuthTokens(newToken, newRefresh);
      return true;
    }

    cookies.clearAuthTokens();
    return false;
  }

  if (!token || !verifyToken(token)) {
    return <Navigate to='/login' />;
  }
  return <Layout />;
};

export default PrivateRoute;
