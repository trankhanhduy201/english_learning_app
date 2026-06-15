import { useEffect, useState, useRef, useCallback } from "react";
import * as cookies from "../commons/cookies";
import * as tokenCommon from "../commons/token";
import { TOKEN_VERIFY_INTERVAL } from "../configs/appConfig";

const useCheckAuth = ({ 
  pageName = null, 
  hasCheckExpired, 
  isPassServerAuth,
  skipFirstVerify = false
}) => {
  const [dataAuth, setDataAuth] = useState({
    isLogged: skipFirstVerify ? true : null,
    isExpired: false
  });
  const countUpRef = useRef(1);

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

  const throttledVerify = useCallback(
    async () => {
      if (skipFirstVerify && countUpRef.current === 1) {
        countUpRef.current += 1;
        return;
      }

      setIsLogged(null);
      if (isPassServerAuth) {
        setIsLogged(true);
        return;
      }

      const token = cookies.getAccessToken();
      const verified = await tokenCommon.verifyToken(token);
      setIsLogged(verified);
    },
    [isPassServerAuth, skipFirstVerify]
  );

  useEffect(() => {
    throttledVerify();
  }, [pageName, throttledVerify]);

  useEffect(() => {
    if (!hasCheckExpired) return;

    const checkExpired = async () => {
      const token = cookies.getAccessToken();
      const verified = await tokenCommon.localVerifyToken(token);
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