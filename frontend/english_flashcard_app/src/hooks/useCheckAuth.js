import { useEffect, useState } from "react";
import * as cookieUtils from "../utils/cookies";
import * as authCommon from "../commons/authCommon";

const useCheckAuth = ({ hasCheckExpired }) => {
  const [ dataAuth, setDataAuth ] = useState({
    isLogged: null,
    isExpired: false
  });

  const setIsLogged = isLogged => setDataAuth(state => ({ ...state, isLogged: isLogged }));
  const setIsExpired = isExpired => setDataAuth(state => ({ ...state, isExpired: isExpired }));

  useEffect(() => {
    const verify = async () => {
      const { token, refreshToken } = cookieUtils.getAuthTokens();
      const verified = await authCommon.verifyToken(token, refreshToken);
      setIsLogged(verified);
    }
    setIsLogged(null);
    verify();

    // For checking expiration
    if (hasCheckExpired) {
      const checkExpired = async () => {
        const { token, refreshToken } = cookieUtils.getAuthTokens();
        const verified = await authCommon.localVerifyToken(token, refreshToken);
        setIsExpired(!verified);
      }
      const interval = setInterval(() => checkExpired(), 60000);
      return () => clearInterval(interval);
    }
  }, []);

  return { 
    ...dataAuth,
    setIsLogged,
    setIsExpired
  };
}

export default useCheckAuth;