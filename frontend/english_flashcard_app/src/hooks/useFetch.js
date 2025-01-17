import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setError, clearError } from "../stores/slices/errorSlice"

const useFetch = (callApiFunc) => {
  const [data, setData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const callApi = async () => {
      dispatch(clearError());
      try {
        const results = await callApiFunc();
        setData(results.data);
      } catch (error) {
        dispatch(setError(error?.errors?.detail || 'Something wrong'));
      }
    }
    callApi();
  }, [callApiFunc]);

  return {
    data
  }
}
export default useFetch