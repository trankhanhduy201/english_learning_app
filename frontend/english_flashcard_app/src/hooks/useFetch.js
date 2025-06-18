import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAlert, clearAlert } from "../stores/slices/errorSlice";
import * as alertConfig from "../configs/alertConfig";

const useFetch = (callApiFunc) => {
  const [data, setData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const callApi = async () => {
      dispatch(clearAlert());
      try {
        const results = await callApiFunc();
        setData(results.data);
      } catch (error) {
        dispatch(
          setAlert({
            type: alertConfig.ERROR_TYPE,
            message: error?.errors?.detail || "Something wrong",
          }),
        );
      }
    };
    callApi();
  }, [callApiFunc]);

  return {
    data,
  };
};
export default useFetch;
