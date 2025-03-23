import * as authApi from "../services/authApi";
import { Navigate, useLocation } from "react-router-dom";
import * as cookies from "../utils/cookies";
import { useEffect, useState } from "react";
import LoadingOverlay from '../components/LoadingOverlay';

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

  const { newToken, newRefresh } = await refreshNewToken(refreshToken, { throwEx: false });
  if (newToken) {
    cookies.setAuthTokens(newToken, newRefresh);
    return true;
  }

  cookies.clearAuthTokens();
  return false;
}

const PrivatePage = ({children}) => {
  const location = useLocation();
  const [ isVerified, setIsVerified ] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const { token, refreshToken } = cookies.getAuthTokens();
      const verified = await verifyToken(token, refreshToken);
      setIsVerified(verified);
    }
    verify();
  }, [location.pathname]);

  if (isVerified === null) {
    return <LoadingOverlay />;
  }

  if (!isVerified) {
    return <Navigate to='/login' />;
  }
  return (<>{children}</>);
};

export default PrivatePage;
