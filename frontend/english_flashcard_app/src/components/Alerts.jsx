import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearAlert } from "../stores/slices/alertSlice";
import AutoDismissAlert from "./AutoDismissAlert";

const Alerts = () => {
  const alerts = useSelector((state) => state.alerts);
  const dispatch = useDispatch();
  const onClose = (id) => dispatch(clearAlert(id));

  if (!alerts || alerts.length === 0) 
    return null;

  return (
    <>
      <div className="position-fixed end-0 w-100" style={{ top: "20px", zIndex: 1050 }}>
        {alerts.map((alert, index) => (
          <div key={alert.idx} className="col-12 col-md-6 col-lg-4 ms-auto">
            <AutoDismissAlert
              key={alert.idx}
              idx={alert.idx}
              message={alert.message}
              type={alert.type}
              duration={2000}
              onClose={onClose}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default Alerts;
