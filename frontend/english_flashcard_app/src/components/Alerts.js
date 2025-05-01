import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearAlert } from "../stores/slices/alertSlice";
import AutoDismissAlert from "./AutoDismissAlert";

const Alerts = () => {
  const alerts = useSelector((state) => state.alerts);
  const dispatch = useDispatch();
  const onClose = (id) => dispatch(clearAlert(id));

  if (!alerts) return null;

  return (
    <>
      {alerts.map((alert, index) => (
        <AutoDismissAlert
          key={index}
          id={alert.idx}
          message={alert.message}
          type={alert.type}
          duration={2000}
          onClose={onClose}
        />
      ))}
    </>
  );
};

export default Alerts;
