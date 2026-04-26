import { useEffect, useState, useMemo } from "react";
import throttle from "lodash/throttle";
import * as cookies from "../commons/cookies";
import * as tokenCommon from "../commons/token";
import { THROTTLING_TOKEN_VERIFY, TOKEN_VERIFY_INTERVAL } from "../configs/appConfig";

const useCheckAuth = ({ pageName = null, hasCheckExpired, isPassServerAuth }) => {
  const [dataAuth, setDataAuth] = useState({
    isLogged: null,
    isExpired: false
  });

  const setIsLogged = (isLogged) => {
    setDataAuth((state) =>
      state.isLogged !== isLogged
        ? { ...state, isLogged }
        : state
    );
  }

  const setIsExpired = (isExpired) => {
    setDataAuth((state) =>
      state.isExpired !== isExpired
        ? { ...state, isExpired }
        : state
    );
  }

  // Throttle auth verification
  const throttledVerify = useMemo(
    () =>
      throttle(
        async () => {
          setIsLogged(null);
          if (isPassServerAuth) {
            setIsLogged(true);
            return;
          }

          const { token, refreshToken } = cookies.getAuthTokens();
          const verified = await tokenCommon.verifyToken(
            token,
            refreshToken
          );
          setIsLogged(verified);
        },
        THROTTLING_TOKEN_VERIFY,
        {
          leading: true,
          trailing: false,
        }
      ),
    [isPassServerAuth]
  );

  useEffect(() => {
    throttledVerify();
  }, [pageName, throttledVerify]);

  useEffect(() => {
    if (!hasCheckExpired) return;

    const checkExpired = async () => {
      const { token, refreshToken } = cookies.getAuthTokens();
      const verified = await tokenCommon.localVerifyToken(
        token,
        refreshToken
      );
      setIsExpired(!verified);
    };

    const interval = setInterval(
      checkExpired, 
      TOKEN_VERIFY_INTERVAL
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    ...dataAuth,
    setIsLogged,
    setIsExpired,
  };
};

export default useCheckAuth;