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
      <div className="position-absolute top-0 end-0 w-100">
        {alerts.map((alert, index) => (
          <>
            <div className="col-12 col-md-6 col-lg-4 ms-auto">
              <AutoDismissAlert
                key={index}
                id={alert.idx}
                message={alert.message}
                type={alert.type}
                duration={2000}
                onClose={onClose}
              />
            </div>
          </>
        ))}
      </div>
    </>
  );
};

export default Alerts;
