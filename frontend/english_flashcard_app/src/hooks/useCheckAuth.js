import { useEffect, useState } from "react";
import * as cookies from "../commons/cookies";
import * as tokenCommon from "../commons/token";

const useCheckAuth = ({ hasCheckExpired }) => {
  const [dataAuth, setDataAuth] = useState({
    isLogged: null,
    isExpired: false,
  });

  const setIsLogged = isLogged =>
    setDataAuth(state => 
      state.isLogged != isLogged 
        ? { ...state, isLogged: isLogged } 
        : state
    );

  const setIsExpired = isExpired =>
    setDataAuth(state => 
      state.isExpired != isExpired 
        ? { ...state, isExpired: isExpired } 
        : state
    );

  useEffect(() => {
    const verify = async () => {
      const { token, refreshToken } = cookies.getAuthTokens();
      const verified = await tokenCommon.verifyToken(token, refreshToken);
      setIsLogged(verified);
    };
    setIsLogged(null);
    verify();

    // For checking expiration
    if (hasCheckExpired) {
      const checkExpired = async () => {
        const { token, refreshToken } = cookies.getAuthTokens();
        const verified = await tokenCommon.localVerifyToken(
          token,
          refreshToken,
        );
        setIsExpired(!verified);
      };
      const interval = setInterval(() => checkExpired(), 5000);
      return () => clearInterval(interval);
    }
  }, []);

  return {
    ...dataAuth,
    setIsLogged,
    setIsExpired,
  };
};

export default useCheckAuth;
