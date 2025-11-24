import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { setAlert } from "../stores/slices/alertSlice";
import * as alertConfig from "../configs/alertConfig";

const useFetch = ({ callApiFunc, manual = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const dispatch = useDispatch();

  const allowFetch = useRef(manual);

  const refetch = useCallback(() => {
    allowFetch.current = true;
    setReload(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!allowFetch.current) return; // skip first load if manual

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await callApiFunc({ signal });
        setData(results.data ?? []);
      } catch (err) {
        if (err.name !== "AbortError") {
          const message = err?.errors?.detail || "Something wrong";
          setError(message);
          dispatch(setAlert({ type: alertConfig.ERROR_TYPE, message }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [callApiFunc, reload, dispatch, manual]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useFetch;
