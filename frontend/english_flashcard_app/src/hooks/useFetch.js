import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { throttle } from "lodash";
import { setAlert } from "../stores/slices/alertSlice";
import * as alertConfig from "../configs/alertConfig";

const useFetch = ({ callApiFunc, manualFetch = false, throttleSeconds = 0.5 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const dispatch = useDispatch();

  const allowFetch = useRef(!manualFetch);

  const refetch = useMemo(
    () => 
      throttle(
        () => {
          allowFetch.current = true;
          setReload(prev => prev + 1);
        }, 
        throttleSeconds * 1000,
        { leading: true, trailing: false }
      ),
    [throttleSeconds]
  )

  useEffect(() => {
    if (!allowFetch.current) return;

    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await callApiFunc({ signal: controller.signal });
        setData(results?.data ?? []);
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
  }, [callApiFunc, reload]);

  return { data, loading, error, refetch };
};

export default useFetch;
