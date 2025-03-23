import * as authApi from "../services/authApi";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import * as cookies from "../utils/cookies";
import { useEffect, useState } from "react";
import LoadingOverlay from '../components/LoadingOverlay';
import Home from '../pages/Home';
import Topics from '../pages/Topics';
import Topic from '../pages/Topic';
import TopicLearn from '../pages/TopicLearn';
import Vocab from '../pages/Vocab';

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

  const { access, refresh } = await refreshNewToken(refreshToken, { throwEx: false });
  if (access) {
    cookies.setAuthTokens(access, refresh);
    return true;
  }

  cookies.clearAuthTokens();
  return false;
}

const PrivatePage = ({ pageName }) => {
  const [ isVerified, setIsVerified ] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const { token, refreshToken } = cookies.getAuthTokens();
      const verified = await verifyToken(token, refreshToken);
      setIsVerified(verified);
    }

    setIsVerified(null);
    verify();
  }, [pageName]);

  if (isVerified === null) {
    return <LoadingOverlay />;
  }

  if (!isVerified) {
    return <Navigate to='/login' />;
  }

  switch (pageName) {
    case 'Home':
      return <Home />;
    case 'Topics':
      return <Topics />;
    case 'Topic':
      return <Topic />;
    case 'Vocab':
      return <Vocab />;
    case 'TopicLearn':
      return <TopicLearn />;
    default:
      return <Home />;
  }
};

export default PrivatePage;
