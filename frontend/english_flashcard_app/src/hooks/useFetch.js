import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAlert, clearAlert } from "../stores/slices/errorSlice"
import * as alertConfigs from "../configs/alertConfigs";

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
        dispatch(setAlert({
          type: alertConfigs.ERROR_TYPE,
          message: error?.errors?.detail || 'Something wrong'
        }));
      }
    }
    callApi();
  }, [callApiFunc]);

  return {
    data
  }
}
export default useFetch