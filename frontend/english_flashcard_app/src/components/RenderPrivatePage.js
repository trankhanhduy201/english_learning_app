import * as authApi from "../services/authApi";
import { Navigate } from "react-router-dom";
import * as cookies from "../utils/cookies";
import Home from "../pages/Home";
import Topics from "./Topics";
import Topic from "../pages/Topic";

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

  console.log(refreshToken);
  const { newToken, newRefresh } = await refreshNewToken(refreshToken, { throwEx: false });
  if (newToken) {
    cookies.setAuthTokens(newToken, newRefresh);
    return true;
  }

  cookies.clearAuthTokens();
  return false;
}

const PrivateRoute = ({ pageName }) => {
  const { token, refreshToken } = cookies.getAuthTokens();

  if (!token || !verifyToken(token, refreshToken)) {
    return <Navigate to='/login' />;
  }
  
  switch (pageName) {
    case 'home':
      return <Home />;
    case 'topics':
      return <Topics />;
    case 'topic':
      return <Topic />;
  }
};

export default PrivateRoute;
